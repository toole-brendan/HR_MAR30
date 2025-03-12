#!/bin/bash

# Build the project
echo "🏗️ Building project..."
npm run build

# Upload to S3 with correct cache settings
echo "📤 Uploading to S3..."

# Upload JS files with long cache duration
aws s3 sync dist/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "*.html" \
  --content-type "application/javascript" \
  --include "*.js"

# Upload all files except HTML and JS with long cache duration
aws s3 sync dist/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "*.html" \
  --exclude "*.js"

# Upload HTML files with no-cache
aws s3 sync dist/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "no-cache" \
  --include "*.html"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E3T7VX6HV95Q5O \
  --paths "/defense/*"

echo "✅ Deployment complete!" 