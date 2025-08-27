#!/bin/bash

echo "🚀 Monroe Maps - Quick Start Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  .env.local file not found!"
    echo "   Please create a .env.local file with your configuration:"
    echo ""
    echo "   # Copy env.example and fill in your values"
    echo "   cp env.example .env.local"
    echo ""
    echo "   # Required environment variables:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key"
    echo ""
    echo "   See README.md for detailed setup instructions"
    echo ""
else
    echo "✅ .env.local file found"
fi

# Build the project
echo ""
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "🎉 Setup complete! You can now:"
echo ""
echo "   1. Start the development server:"
echo "      npm run dev"
echo ""
echo "   2. Open http://localhost:3000 in your browser"
echo ""
echo "   3. Deploy to Vercel (see DEPLOYMENT.md)"
echo ""
echo "📚 For more information, see README.md and DEPLOYMENT.md"

