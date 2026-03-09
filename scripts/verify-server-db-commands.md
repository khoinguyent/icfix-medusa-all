# Commands to Verify Promotional Content Tables on Server Database

Run these commands on your backend server where docker-compose-prod.yml is running.

## Quick Verification

```bash
# 1. List all tables and check for promotional content tables
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "\dt" | grep -E "(promotional_banner|service_feature|testimonial|homepage_section)"

# 2. Check if all 4 tables exist
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotional_banner') THEN '✅ promotional_banner EXISTS' ELSE '❌ promotional_banner MISSING' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_feature') THEN '✅ service_feature EXISTS' ELSE '❌ service_feature MISSING' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonial') THEN '✅ testimonial EXISTS' ELSE '❌ testimonial MISSING' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'homepage_section') THEN '✅ homepage_section EXISTS' ELSE '❌ homepage_section MISSING' END;
"

# 3. Get record counts for each table
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "
SELECT 
    'promotional_banner' as table_name, COUNT(*) as record_count FROM promotional_banner
UNION ALL
SELECT 
    'service_feature' as table_name, COUNT(*) as record_count FROM service_feature
UNION ALL
SELECT 
    'testimonial' as table_name, COUNT(*) as record_count FROM testimonial
UNION ALL
SELECT 
    'homepage_section' as table_name, COUNT(*) as record_count FROM homepage_section;
"
```

## Detailed Table Structure Verification

```bash
# Check promotional_banner table structure
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "\d promotional_banner"

# Check service_feature table structure
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "\d service_feature"

# Check testimonial table structure
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "\d testimonial"

# Check homepage_section table structure
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "\d homepage_section"
```

## Interactive psql Session

```bash
# Connect to database interactively
docker exec -it icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db}

# Then run these SQL commands:
# \dt                    # List all tables
# \d promotional_banner  # Describe promotional_banner table
# \d service_feature      # Describe service_feature table
# \d testimonial         # Describe testimonial table
# \d homepage_section     # Describe homepage_section table
# SELECT COUNT(*) FROM promotional_banner;
# SELECT COUNT(*) FROM service_feature;
# SELECT COUNT(*) FROM testimonial;
# SELECT COUNT(*) FROM homepage_section;
# \q                     # Exit
```

## If Tables Are Missing

If any tables are missing, run migrations:

```bash
# Run database migrations
docker exec icfix-backend npm run db:migrate

# Verify again
docker exec icfix-postgres psql -U ${POSTGRES_USER:-icfix_user} -d ${POSTGRES_DB:-icfix_db} -c "\dt" | grep -E "(promotional_banner|service_feature|testimonial|homepage_section)"
```
