#!/bin/bash

echo "🧪 Starting Football Formation Builder Tests..."

# Start local server in background
echo "📡 Starting local server..."
python3 -m http.server 8080 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Run tests
echo "🚀 Running Playwright tests..."
npm test

# Kill server
echo "🛑 Stopping server..."
kill $SERVER_PID

echo "✅ Tests completed!"
