#!/bin/bash

# 🚀 Commit and Deploy Enhanced Expense Tracker
# This script commits all changes to a new branch and deploys for testing

set -e  # Exit on any error

echo "🚀 Committing changes and deploying Enhanced Expense Tracker..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Create and switch to feature branch
print_status "Creating feature branch..."
git checkout -b feature/comprehensive-expense-tracker 2>/dev/null || git checkout feature/comprehensive-expense-tracker

# Add all changes
print_status "Adding all changes..."
git add .

# Commit with comprehensive message
print_status "Committing changes..."
git commit -m "feat: implement comprehensive financial management system

🚀 NEW FEATURES IMPLEMENTED:

📊 Backend Infrastructure:
- Enhanced Expense & Income models with tags, descriptions, recurring transactions
- Budget model with real-time tracking and alerts
- Category model with hierarchical structure and default seeding
- Goal model with milestone tracking and progress monitoring
- Notification model with automated alert system
- Complete CRUD controllers for all new features
- Enhanced dashboard with financial health scoring

🎨 Frontend Infrastructure:
- Comprehensive API client with error handling
- Budget Context with React state management
- Budget management page with visual charts
- Responsive UI with Tailwind CSS
- Interactive data visualization with Recharts

💰 Budget Management:
- Multi-period budgets (weekly/monthly/yearly)
- Real-time spending tracking with color-coded alerts
- Budget vs actual visualization
- Automatic threshold notifications

🎯 Goal Tracking:
- Multiple goal types (savings, debt, investment, purchase)
- Milestone tracking with contribution management
- Deadline monitoring and progress visualization
- Auto-contribution functionality

📁 Category System:
- 16 pre-seeded default categories
- Custom category creation with icons and colors
- Category usage statistics and analytics
- Hierarchical category structure

🔔 Notification System:
- Automated budget alerts
- Goal deadline reminders
- Spending pattern notifications
- Mark as read/unread functionality

🔍 Enhanced Features:
- Advanced search and filtering
- Pagination for large datasets
- Enhanced Excel export with filters
- Financial health scoring algorithm
- Monthly trend analysis
- Category spending breakdowns

🛠️ Technical Improvements:
- Comprehensive error handling
- Input validation on all endpoints
- Database indexing for performance
- Environment configuration
- Docker deployment setup
- Production-ready architecture

📱 UI/UX Enhancements:
- Modern, responsive design
- Interactive charts and visualizations
- Loading states and error handling
- Toast notification system
- Modal forms and dialogs
- Color-coded status indicators

🔒 Security & Performance:
- JWT token management
- API request interceptors
- Proper error boundaries
- Database relationship optimization
- Clean, maintainable code architecture

This transforms the basic expense tracker into a comprehensive
personal finance management system ready for production use."

print_success "Changes committed to feature branch!"

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
print_status "Starting deployment..."
./deploy.sh

print_success "🎉 Deployment completed!"

echo ""
echo "📋 Your enhanced expense tracker is now running with:"
echo "  ✅ Budget management with real-time tracking"
echo "  ✅ Goal tracking with milestone monitoring"
echo "  ✅ Advanced analytics and reporting"
echo "  ✅ Automated notification system"
echo "  ✅ Enhanced UI with interactive charts"
echo "  ✅ Category system with default seeding"
echo ""

echo "🌐 Access your application:"
echo "  Frontend: http://localhost:5173"
echo "  Backend: http://localhost:5001"
echo ""

echo "📖 For detailed testing guide, see:"
echo "  - README_DEPLOYMENT.md (Quick start)"
echo "  - DEPLOYMENT_GUIDE.md (Comprehensive guide)"
echo "  - IMPLEMENTATION_SUMMARY.md (Feature overview)"