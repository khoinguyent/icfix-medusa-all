#!/bin/bash
# Helper script to load environment variables from scripts/.env
# Usage: source scripts/load-env.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found!" >&2
    echo "Please copy scripts/.env.example to scripts/.env and fill in your credentials." >&2
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Validate required variables
if [ -z "$SERVER_IP" ] || [ -z "$SERVER_USER" ] || [ -z "$SERVER_PASS" ]; then
    echo "Error: Missing required server credentials in $ENV_FILE" >&2
    exit 1
fi

