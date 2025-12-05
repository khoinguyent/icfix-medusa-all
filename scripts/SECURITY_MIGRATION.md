# Security Migration Guide

## Issue

Multiple shell scripts contain hardcoded sensitive credentials committed to the repository, including:
- Server IP addresses and passwords
- GitHub Personal Access Tokens
- Revalidation secrets

## Fixed Files

The following files have been updated to use environment variables from `scripts/.env`:

1. ✅ `scripts/check-and-cleanup-docker.exp`
2. ✅ `scripts/update-github-token.exp`
3. ✅ `scripts/manual-revalidate-frontend.sh`

## Remaining Files

The following files still contain hardcoded credentials and should be migrated:

**Expect Scripts (`.exp` files):**
- `scripts/deploy-with-ghcr-auth.exp`
- `scripts/deploy-backend-server.exp`
- `scripts/quick-deploy-backend.exp`
- `scripts/check-backend-and-start-nginx.exp`
- `scripts/deploy-and-check-services.exp`
- `scripts/check-backend-errors.exp`
- `scripts/check-nginx-config.exp`
- `scripts/deploy-latest-backend.exp`
- `scripts/pull-and-restart-simple.exp`
- `scripts/update-and-deploy-latest.exp`
- `scripts/check-service-status.exp`
- `scripts/check-docker-compose.exp`
- `scripts/update-and-run-deploy.exp`
- `scripts/read-deploy-script.exp`
- `scripts/run-deploy-latest.exp`
- `scripts/pull-and-restart-final.exp`
- `scripts/check-inodes-and-docker-storage.exp`
- `scripts/cleanup-docker-and-restart.exp`
- `scripts/check-backend-logs.exp`
- `scripts/restart-backend-simple.exp`
- `scripts/update-and-restart-backend.exp`
- `scripts/show-docker-compose.exp`
- `scripts/kill-vim-and-clean.exp`
- `scripts/fix-swap-file.exp`
- `scripts/update-to-latest-image.exp`
- `scripts/update-docker-compose-image.exp`
- `scripts/simple-check-image.exp`
- `scripts/check-docker-image.exp`
- `scripts/simple-verify-token.exp`
- `scripts/verify-github-token-updated.exp`
- `scripts/check-ghcr-access.exp`
- `scripts/verify-github-key.exp`
- `scripts/check-category-parent-and-fix.exp`
- `scripts/verify-category-store-api.exp`
- `scripts/fix-category-sales-channel.exp`
- `scripts/fix-and-verify-category.exp`
- `scripts/check-sales-channel-assoc.exp`
- `scripts/query-category-db.exp`
- `scripts/check-db-user-and-admin.exp`
- `scripts/check-category-db-and-api.exp`
- `scripts/check-category-backend.exp`
- `scripts/fix-env-and-validate.exp`
- `scripts/restart-with-new-env.exp`
- `scripts/check-env-file.exp`
- `scripts/ssh-check-backend.exp`

**Bash Scripts (`.sh` files):**
- `scripts/ssh-to-server.sh`
- `scripts/check-image-df27e02.sh`
- `scripts/verify-category-frontend.sh`
- `scripts/connect-backend.sh`
- `scripts/check-backend-config.sh`

## Migration Pattern

### For Expect Scripts (`.exp`)

Replace:
```expect
set server_ip "116.118.48.209"
set server_user "root"
set server_pass "46532@Nvc"
set github_token "ghp_..."
```

With:
```expect
# Load environment variables
set script_dir [file dirname [file normalize [info script]]]
source [file join $script_dir load-env.exp]

set server_ip $::server_ip
set server_user $::server_user
set server_pass $::server_pass
set github_token $::github_token
```

### For Bash Scripts (`.sh`)

Replace hardcoded values with environment variable loading:
```bash
# Load environment variables from scripts/.env if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Use environment variables with defaults
SERVER_IP="${SERVER_IP:-default_value}"
```

## Immediate Actions Required

1. **Rotate all exposed credentials:**
   - Change server password
   - Revoke and regenerate GitHub token
   - Update revalidation secret

2. **Set up `scripts/.env`:**
   ```bash
   cp scripts/.env.example scripts/.env
   # Edit with new credentials
   chmod 600 scripts/.env
   ```

3. **Migrate remaining scripts** (use the pattern above)

4. **Verify `.gitignore` includes `scripts/.env`**

5. **Review git history** - Consider using `git filter-branch` or BFG Repo-Cleaner to remove credentials from history (if repository is private and you have backups)

## Testing

After migration, test scripts to ensure they work:
```bash
# Test expect script
./scripts/check-and-cleanup-docker.exp

# Test bash script
./scripts/manual-revalidate-frontend.sh
```

## Security Best Practices

- ✅ Use environment variables or config files (gitignored)
- ✅ Set restrictive file permissions: `chmod 600 scripts/.env`
- ✅ Rotate credentials regularly
- ✅ Use secrets management in CI/CD (GitHub Secrets, etc.)
- ❌ Never hardcode credentials
- ❌ Never commit `.env` files
- ❌ Never share credentials in chat/email

