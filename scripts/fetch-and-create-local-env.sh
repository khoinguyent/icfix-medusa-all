#!/bin/bash

# Fetch server .env and create local .env template

SERVER_IP="116.118.48.209"
SERVER_USER="root"
SERVER_PASS="46532@Nvc"

echo "========================================="
echo "  Fetching Server .env Configuration"
echo "========================================="
echo ""

# Use expect to fetch .env file
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${SERVER_USER}@${SERVER_IP}
expect {
    "password:" {
        send "${SERVER_PASS}\r"
        exp_continue
    }
    "Password:" {
        send "${SERVER_PASS}\r"
        exp_continue
    }
    -re "#|\\$" {
        send "cd /root/icfix-medusa && cat .env\r"
        expect -re "#|\\$"
        send "exit\r"
        expect eof
    }
    timeout {
        puts "ERROR: Connection timeout"
        exit 1
    }
}
EOF

