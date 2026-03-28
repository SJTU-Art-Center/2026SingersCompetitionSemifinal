#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "========================================="
echo "  Super Singer System - Quick Start"
echo "========================================="
echo ""
echo "[1/2] Starting Backend Server (Port:3001)..."
(cd "$SCRIPT_DIR/server" && npm install --silent && node index.js) &
SERVER_PID=$!

echo ""
echo "[2/2] Starting Frontend App (Port:5173)..."
(cd "$SCRIPT_DIR/client" && npm install --include=dev --silent && npm run dev -- --host) &
CLIENT_PID=$!


echo ""
echo "========================================="
echo "ALL SERVICES STARTED!"
echo ""
echo "Open on THIS computer:"
echo "  Admin Panel:  http://localhost:5173/admin"
echo "  Big Screen:   http://localhost:5173/screen"
echo ""
echo "To access from other devices on the same Wi-Fi,"
echo "replace 'localhost' with your IPv4 Address."
echo "========================================="
echo "(Press Ctrl+C to stop all servers)"
echo ""

# Wait for both background processes; on Ctrl+C kill both
trap "echo ''; echo 'Stopping...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM
wait $SERVER_PID $CLIENT_PID
