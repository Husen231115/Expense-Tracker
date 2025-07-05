#!/bin/bash

# 🚀 Expense Tracker - Deployment Script
# This script sets up and deploys the comprehensive expense tracker

set -e  # Exit on any error

echo "🚀 Starting Expense Tracker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "All prerequisites are installed!"

# Create a new branch for the features
print_status "Creating feature branch..."
if git rev-parse --verify feature/comprehensive-expense-tracker &> /dev/null; then
    print_warning "Branch 'feature/comprehensive-expense-tracker' already exists. Switching to it..."
    git checkout feature/comprehensive-expense-tracker
else
    git checkout -b feature/comprehensive-expense-tracker
    print_success "Created and switched to branch 'feature/comprehensive-expense-tracker'"
fi

# Install root dependencies
print_status "Installing development dependencies..."
npm install

# Install project dependencies
print_status "Installing project dependencies..."
npm run install-all

# Stop any running containers
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
print_status "Checking service status..."

# Check MongoDB
if docker exec expense-tracker-mongo mongosh --eval "db.runCommand({ping: 1})" &> /dev/null; then
    print_success "MongoDB is running"
else
    print_error "MongoDB failed to start"
    docker-compose logs mongodb
    exit 1
fi

# Check Backend
if curl -f http://localhost:5001/api/v1/auth/login &> /dev/null; then
    print_success "Backend is running"
else
    print_warning "Backend might be starting up, checking logs..."
    docker-compose logs backend | tail -10
fi

# Check Frontend
if curl -f http://localhost:5173 &> /dev/null; then
    print_success "Frontend is running"
else
    print_warning "Frontend might be starting up, checking logs..."
    docker-compose logs frontend | tail -10
fi

print_success "🎉 Deployment completed!"

echo ""
echo "📋 Access URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:5001"
echo "  MongoDB: localhost:27017"
echo ""

echo "📊 Test the new features:"
echo "  1. Register/Login at http://localhost:5173"
echo "  2. Navigate to /budgets to test budget management"
echo "  3. Check the enhanced dashboard"
echo "  4. Test expense tracking with categories"
echo ""

echo "🔧 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo ""

echo "📖 For detailed testing guide, see DEPLOYMENT_GUIDE.md"

# Optional: Open the application in browser (macOS/Linux)
if command -v open &> /dev/null; then
    read -p "Would you like to open the application in your browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:5173
    fi
elif command -v xdg-open &> /dev/null; then
    read -p "Would you like to open the application in your browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:5173
    fi
fi

print_success "Happy testing! 🚀"