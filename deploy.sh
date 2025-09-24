#!/bin/bash

echo "🚀 Deploying Flotix Frontend (Next.js)..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Check if .env.local file exists, if not copy from example
if [ ! -f .env.local ]; then
    print_warning ".env.local file not found. Copying from .env.example"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        print_warning "Please edit .env.local file with your backend API URL before building"
        print_warning "Update NEXT_PUBLIC_API_BASE_URL to point to your backend server"
    else
        print_error ".env.example file not found"
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
fi

# Type check
echo "🔍 Running TypeScript type check..."
if npm run type-check; then
    print_status "Type checking passed"
else
    print_error "Type checking failed. Please fix TypeScript errors."
fi

# Build the application
echo "🏗️  Building Next.js application..."
if npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
fi

# Start the production server
echo "🎯 Starting production server..."
if npm start &; then
    print_status "Frontend started successfully"

    # Wait for server to start
    sleep 3

    # Check if server is responding
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Server is responding"
    else
        print_warning "Server might still be starting up"
    fi
else
    print_error "Failed to start production server"
fi

# Display status
echo ""
echo "🎉 Frontend deployment completed!"
echo "================================="
echo "Frontend URL: http://localhost:3000"
echo "Admin Login: http://localhost:3000/login"
echo ""
echo "📋 Useful commands:"
echo "  npm run dev         - Start development server"
echo "  npm run build       - Build for production"
echo "  npm start           - Start production server"
echo "  npm run lint        - Lint code"
echo "  npm run type-check  - TypeScript validation"
echo ""
echo "🔧 Configuration:"
echo "  Edit .env.local for environment variables"
echo "  Make sure NEXT_PUBLIC_API_BASE_URL points to your backend"
echo ""
echo "📍 Backend Integration:"
echo "  Ensure your backend is running and accessible"
echo "  Update CORS settings in backend to allow this frontend URL"