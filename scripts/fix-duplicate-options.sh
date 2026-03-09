#!/bin/bash
# Remove duplicate OPTIONS handler from Nginx config

NGINX_CONF="nginx/conf.d/medusa.conf"

if [ ! -f "$NGINX_CONF" ]; then
    echo "Error: $NGINX_CONF not found"
    exit 1
fi

# Show the duplicate
echo "=== Checking for duplicate OPTIONS handlers ==="
grep -n "if.*OPTIONS" "$NGINX_CONF"

# Remove old duplicate block (the one with "# --- CORS preflight ---" comment)
if grep -q "# --- CORS preflight ---" "$NGINX_CONF"; then
    echo "=== Removing duplicate OPTIONS handler ==="
    # Find the line number of the duplicate block
    START_LINE=$(grep -n "# --- CORS preflight ---" "$NGINX_CONF" | cut -d: -f1)
    if [ -n "$START_LINE" ]; then
        # Find the closing brace (look for line with just } and spaces)
        END_LINE=$(awk -v start="$START_LINE" 'NR > start && /^[[:space:]]*}[[:space:]]*$/ {print NR; exit}' "$NGINX_CONF")
        if [ -n "$END_LINE" ]; then
            # Remove lines from START_LINE to END_LINE
            sed -i "${START_LINE},${END_LINE}d" "$NGINX_CONF"
            echo "✅ Removed duplicate OPTIONS handler (lines $START_LINE-$END_LINE)"
        fi
    fi
else
    echo "No duplicate found with '# --- CORS preflight ---' comment"
fi

# Verify
echo "=== Verifying OPTIONS handlers ==="
grep -n "if.*OPTIONS" "$NGINX_CONF"

