#!/bin/bash

# Build the project
echo "🏗️ Building project..."
npm run build

# Upload to S3 with correct cache settings
echo "📤 Uploading to S3..."

# Create a directory to restructure files if needed
mkdir -p dist_deploy

# Copy the content of the public folder directly to the deploy folder 
cp -r dist/public/* dist_deploy/

# Upload JS files with long cache duration and correct content type
aws s3 sync dist_deploy/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "*" \
  --include "*.js" \
  --content-type "application/javascript"

# Upload CSS files with long cache duration and proper content type
aws s3 sync dist_deploy/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "*" \
  --include "*.css" \
  --content-type "text/css"

# Upload other static assets with long cache duration
aws s3 sync dist_deploy/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "*.html" \
  --exclude "*.js" \
  --exclude "*.css"

# Upload HTML files with no-cache
aws s3 sync dist_deploy/ s3://www.handreceipt.com/defense/ \
  --delete \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.html" \
  --content-type "text/html"

# Upload server file to root
aws s3 cp dist/index.js s3://www.handreceipt.com/defense/index.js \
  --cache-control "max-age=31536000,public" \
  --content-type "application/javascript"

# Clean up temporary directory
rm -rf dist_deploy

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E3T7VX6HV95Q5O \
  --paths "/defense/*"

echo "✅ Deployment complete!" 