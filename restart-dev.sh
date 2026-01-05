#!/bin/bash
# Helper script to restart backend dev server

echo "🔍 Checking for processes on port 3001..."

# Kill any process using port 3001
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  Found process on port 3001, killing..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "✅ Port 3001 freed"
else
    echo "✅ Port 3001 is available"
fi

echo "🚀 Starting backend server..."
npm run dev
