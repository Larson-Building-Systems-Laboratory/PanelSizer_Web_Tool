#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Flask API on http://localhost:8000 ..."
cd "$ROOT/api"
source venv/bin/activate
python3 app.py &
FLASK_PID=$!

echo "Starting Next.js frontend on http://localhost:3000 ..."
cd "$ROOT/frontend"
npm run dev &
NEXT_PID=$!

echo ""
echo "  Backend : http://localhost:8000"
echo "  Frontend: http://localhost:3000  ← open this"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $FLASK_PID $NEXT_PID 2>/dev/null" SIGINT SIGTERM
wait
