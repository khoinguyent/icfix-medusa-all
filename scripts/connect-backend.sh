#!/bin/bash

# Script to connect to backend server
# Usage: ./scripts/connect-backend.sh [command]

SERVER_IP="116.118.48.209"
SERVER_USER="root"
SERVER_PASS="46532@Nvc"

if [ -z "$1" ]; then
    echo "Connecting to backend server..."
    echo "IP: $SERVER_IP"
    echo "User: $SERVER_USER"
    echo ""
    echo "You can also use: ssh icfix-backend"
    echo ""
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP"
else
    echo "Executing command on backend server..."
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$@"
fi

