# 🚀 Expense Tracker - Deployment & Testing Guide

## 📋 **Quick Start (Docker - Recommended)**

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- At least 4GB RAM available

### 1. Clone and Prepare
```bash
# If you haven't already, commit all the changes to a new branch
git checkout -b feature/comprehensive-expense-tracker
git add .
git commit -m "feat: implement comprehensive financial management system

- Add budget management with real-time tracking
- Implement goal tracking with milestones
- Add notification system with automated alerts
- Enhance dashboard with financial health scoring
- Implement category system with default seeding
- Add advanced search and filtering
- Enhance expense tracking with budget integration
- Improve error handling and validation
- Add comprehensive API layer
- Implement responsive UI with charts"

# Navigate to project root
cd /path/to/your/expense-tracker
```

### 2. Environment Setup
```bash
# Install root dependencies for development
npm install

# Install all project dependencies
npm run install-all
```

### 3. Deploy with Docker
```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017

---

## 🔧 **Manual Deployment (Alternative)**

### 1. MongoDB Setup
```bash
# Start MongoDB locally (if not using Docker)
mongod --dbpath /path/to/your/db

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env with your Atlas connection string
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend/expense-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 🧪 **Testing All New Features**

### 1. **User Registration/Login**
- Go to http://localhost:5173
- Create a new account or login
- Upload a profile image (test file upload)

### 2. **Category System Testing**
```bash
# Categories are auto-seeded on first login
# Test endpoints:
curl -X GET http://localhost:5001/api/v1/categories \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add custom category
curl -X POST http://localhost:5001/api/v1/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Category",
    "type": "expense",
    "icon": "🏠",
    "color": "#FF6B6B"
  }'
```

### 3. **Budget Management Testing**
- Navigate to `/budgets` in the frontend
- Create a monthly budget for "Food & Dining" - $500
- Add expenses in that category to test budget tracking
- Check budget alerts when you exceed 80% spending

```bash
# API Testing
curl -X POST http://localhost:5001/api/v1/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food & Dining",
    "amount": 500,
    "period": "monthly",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "alertThreshold": 80
  }'
```

### 4. **Goal Tracking Testing**
```bash
# Create a savings goal
curl -X POST http://localhost:5001/api/v1/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency Fund",
    "type": "savings",
    "targetAmount": 10000,
    "targetDate": "2024-12-31",
    "description": "Build 6-month emergency fund"
  }'

# Add contribution to goal
curl -X POST http://localhost:5001/api/v1/goals/GOAL_ID/contribute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "note": "Monthly contribution"
  }'
```

### 5. **Enhanced Expense Tracking**
```bash
# Add expense with new fields
curl -X POST http://localhost:5001/api/v1/expense/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Food & Dining",
    "amount": 45.50,
    "date": "2024-01-15",
    "description": "Lunch at restaurant",
    "tags": ["business", "lunch"],
    "isRecurring": false
  }'
```

### 6. **Notification System Testing**
```bash
# Check notifications
curl -X GET http://localhost:5001/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Trigger budget alerts check
curl -X POST http://localhost:5001/api/v1/notifications/check-budget-alerts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Trigger goal reminders check
curl -X POST http://localhost:5001/api/v1/notifications/check-goal-reminders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. **Dashboard Analytics Testing**
```bash
# Get enhanced dashboard data
curl -X GET http://localhost:5001/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. **Advanced Search & Filtering**
```bash
# Search expenses with filters
curl -X GET "http://localhost:5001/api/v1/expense/get?category=Food&startDate=2024-01-01&endDate=2024-01-31&search=lunch" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Download filtered Excel report
curl -X GET "http://localhost:5001/api/v1/expense/downloadexcel?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output expenses_report.xlsx
```

---

## 📊 **Feature Testing Checklist**

### ✅ **Budget Management**
- [ ] Create weekly/monthly/yearly budgets
- [ ] View budget summary with charts
- [ ] Get budget alerts when exceeding thresholds
- [ ] Edit and delete budgets
- [ ] Filter budgets by period/category
- [ ] View budget vs spent visualization

### ✅ **Goal Tracking**
- [ ] Create different goal types (savings, debt, investment, purchase)
- [ ] Add contributions to goals
- [ ] View goal progress and deadlines
- [ ] Get reminders for upcoming deadlines
- [ ] View goal statistics

### ✅ **Category System**
- [ ] View default categories (16 pre-seeded)
- [ ] Create custom categories with icons/colors
- [ ] View category statistics
- [ ] Delete unused categories (protection for used ones)

### ✅ **Enhanced Expense Tracking**
- [ ] Add expenses with descriptions and tags
- [ ] Budget integration (automatic alerts)
- [ ] Advanced filtering (date, category, tags, search)
- [ ] Pagination for large datasets
- [ ] Enhanced Excel export with filters

### ✅ **Notification System**
- [ ] Automatic budget alerts
- [ ] Goal deadline reminders
- [ ] Mark notifications as read/unread
- [ ] View notification statistics
- [ ] Auto-cleanup expired notifications

### ✅ **Dashboard Analytics**
- [ ] Financial health score
- [ ] Monthly income/expense trends
- [ ] Category spending breakdowns
- [ ] Budget utilization metrics
- [ ] Goal progress overview
- [ ] Savings rate calculation

---

## 🛠️ **Troubleshooting**

### Common Issues:

#### 1. **Docker Issues**
```bash
# If containers fail to start
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

#### 2. **MongoDB Connection Issues**
```bash
# Check MongoDB status
docker exec -it expense-tracker-mongo mongosh

# If using local MongoDB
brew services start mongodb-community@7.0  # macOS
sudo systemctl start mongod                 # Linux
```

#### 3. **Port Conflicts**
```bash
# Check if ports are in use
lsof -i :5001  # Backend port
lsof -i :5173  # Frontend port
lsof -i :27017 # MongoDB port

# Kill processes if needed
kill -9 PID
```

#### 4. **Environment Variables**
```bash
# Verify .env files exist and are configured
ls -la backend/.env
ls -la frontend/expense-tracker/.env

# Check environment variables in containers
docker exec -it expense-tracker-backend env
```

#### 5. **Frontend Build Issues**
```bash
cd frontend/expense-tracker

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm audit fix
```

---

## 🔍 **API Testing with Postman**

### Import Collection
1. Create a new Postman collection
2. Set base URL: `http://localhost:5001/api/v1`
3. Add Authorization header: `Bearer YOUR_JWT_TOKEN`

### Key Endpoints to Test:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /categories` - Get all categories
- `POST /budgets` - Create budget
- `GET /budgets/summary` - Budget summary
- `POST /goals` - Create goal
- `POST /goals/:id/contribute` - Add goal contribution
- `GET /notifications` - Get notifications
- `GET /dashboard` - Enhanced dashboard data

---

## 🚀 **Production Deployment**

### For Cloud Deployment:
1. **Environment Variables**: Update all production URLs and secrets
2. **Database**: Use MongoDB Atlas or managed MongoDB service
3. **Frontend**: Build and deploy to Vercel/Netlify
4. **Backend**: Deploy to Heroku/Railway/DigitalOcean
5. **File Uploads**: Configure cloud storage (AWS S3/Cloudinary)

### Production Environment Variables:
```bash
# Backend
NODE_ENV=production
MONGO_URI=your_production_mongo_uri
JWT_SECRET=your_strong_production_jwt_secret
CLIENT_URL=https://your-frontend-domain.com

# Frontend
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_SERVER_URL=https://your-backend-domain.com
```

---

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Review container/application logs
3. Verify all environment variables are set correctly
4. Ensure all ports are available and not blocked by firewall

The application should now be fully functional with all the comprehensive features implemented! 🎉