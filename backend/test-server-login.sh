#!/bin/bash

# Start server in background
node server.js &
SERVER_PID=$!

# Wait for server to start
echo "Waiting 3 seconds for server to start..."
sleep 3

# Run test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "hosea", "password": "password"}'

# Kill server
echo -e "\n\nStopping server..."
kill $SERVER_PID