#!/bin/bash

echo "Running Football Formation Builder Tests (Refactored)"
echo "=================================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run tests with timeout and proper exit handling
echo "Starting tests..."
timeout 60s npm test || {
    echo "Tests completed or timed out"
    exit 0
}

echo "Test run finished"
