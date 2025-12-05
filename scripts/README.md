# Deployment Scripts

This directory contains scripts for deploying and managing the Medusa backend on the production server.

## Security Notice

**IMPORTANT**: These scripts require sensitive credentials (server passwords, API tokens, etc.). These credentials should **NEVER** be committed to version control.

## Setup

1. **Copy the example environment file:**
   ```bash
   cp scripts/.env.example scripts/.env
   ```

2. **Edit `scripts/.env` and fill in your actual credentials:**
   ```bash
   # Server Configuration
   SERVER_IP=your_server_ip
   SERVER_USER=your_username
   SERVER_PASS=your_password
   
   # GitHub Configuration
   GITHUB_TOKEN=your_github_token
   GITHUB_USER=your_github_username
   
   # Frontend Revalidation
   STOREFRONT_URL=https://your-storefront.com
   REVALIDATE_SECRET=your_revalidate_secret
   ```

3. **Verify `.env` is in `.gitignore`:**
   The `scripts/.env` file should be ignored by git. Check that it's listed in `.gitignore`.

## Usage

### Expect Scripts (for SSH automation)

All expect scripts automatically load credentials from `scripts/.env`:

```bash
./scripts/check-and-cleanup-docker.exp
./scripts/update-github-token.exp
```

### Bash Scripts

Bash scripts can load environment variables from `scripts/.env`:

```bash
# Option 1: Source the loader
source scripts/load-env.sh
./scripts/manual-revalidate-frontend.sh

# Option 2: Scripts will auto-load if .env exists
./scripts/manual-revalidate-frontend.sh
```

## Available Scripts

- `check-and-cleanup-docker.exp` - Check Docker disk usage and clean up unused resources
- `update-github-token.exp` - Update GitHub token for GHCR authentication
- `manual-revalidate-frontend.sh` - Manually trigger frontend cache revalidation
- `deploy-backend-server.exp` - Deploy latest backend image to server
- `quick-deploy-backend.exp` - Quick deployment script

## Troubleshooting

If you see errors about missing environment variables:

1. Ensure `scripts/.env` exists and is properly formatted
2. Check that all required variables are set (no empty values)
3. Verify file permissions: `chmod 600 scripts/.env` (readable only by owner)

## Security Best Practices

- ✅ Use `scripts/.env` for credentials (gitignored)
- ✅ Set restrictive permissions: `chmod 600 scripts/.env`
- ✅ Never commit `.env` files
- ✅ Rotate credentials regularly
- ✅ Use environment variables in CI/CD systems
- ❌ Never hardcode credentials in scripts
- ❌ Never commit credentials to git
