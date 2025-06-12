#!/bin/bash

# Production startup script for Smart Notes API
set -e

echo "🚀 Starting Smart Notes API in production mode..."

# Ensure logs directory exists
mkdir -p logs

# Ensure data directory exists for SQLite
mkdir -p data

# Set production environment
export NODE_ENV=production

# Start the application with proper logging
node src/server.js 2>&1 | tee logs/app.log
