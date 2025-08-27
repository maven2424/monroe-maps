#!/bin/bash

echo "🚀 Auto-pushing Monroe Maps to GitHub..."
echo "========================================"

# Check if we are in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you are in the Monroe Maps folder."
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✅ Found package.json - we are in the right place!"

# Remove any existing Git repository
if [ -d ".git" ]; then
    echo "🗑️  Removing existing Git repository..."
    rm -rf .git
fi

# Initialize Git
echo "🔧 Initializing Git repository..."
git init

# Add all files
echo "📁 Adding all files to Git..."
git add .

# Make commit
echo "💾 Making initial commit..."
git commit -m "Initial commit: Monroe Maps application"

# Add remote origin
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/maven2424/monroe-maps.git

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 Done! Check your GitHub repository:"
echo "https://github.com/maven2424/monroe-maps"
echo ""
echo "If successful, you should see all your files there!"
