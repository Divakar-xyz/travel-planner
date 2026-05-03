#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║         Wandr Travel Planner — Setup Script          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check if .env exists in backend
if [ ! -f "./backend/.env" ]; then
  echo ""
  echo "⚙️  Creating backend/.env from template..."
  cp ./backend/.env.example ./backend/.env
  echo "⚠️  IMPORTANT: Edit backend/.env and add your MongoDB URI before running!"
  echo ""
fi

# Install backend deps
echo "📦 Installing backend dependencies..."
cd backend && npm install
echo "✅ Backend dependencies installed"

cd ../frontend

# Install frontend deps
echo ""
echo "📦 Installing frontend dependencies..."
npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                  Setup Complete! 🎉                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  1. Edit backend/.env with your MongoDB URI          ║"
echo "║  2. Run: cd backend && npm run dev                   ║"
echo "║  3. In another terminal: cd frontend && npm start    ║"
echo "║  4. Open http://localhost:3000                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
