#!/bin/bash
# SSH to backend server
# Usage: ./scripts/ssh-to-server.sh

SERVER_IP="116.118.48.209"
SERVER_USER="root"
SERVER_PASS="46532@Nvc"

echo "Connecting to backend server..."
echo "IP: $SERVER_IP"
echo "User: $SERVER_USER"
echo ""
echo "Command: ssh $SERVER_USER@$SERVER_IP"
echo "Password: $SERVER_PASS"
echo ""

# Try to connect
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP"
