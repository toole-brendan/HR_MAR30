# HandReceipt Defense Frontend Deployment Guide

## Overview
This guide details the correct process for deploying the HandReceipt Defense Frontend (frontend_defense) to the production environment. It includes lessons learned from troubleshooting deployment issues and best practices for future updates.

## Deployment Architecture
The HandReceipt application consists of multiple frontend applications:
- Version Selector (main landing page)
- Defense Frontend (this repository)
- Commercial Frontend 
- Pitch Deck

These are deployed to an AWS S3 bucket and served through CloudFront, with the following URL structure:
- Root: www.handreceipt.com
- Defense: www.handreceipt.com/defense/
- Commercial: www.handreceipt.com/commercial/
- Pitch: www.handreceipt.com/pitch/

## Deployment Methods

### Method 1: Using Enhanced Deploy Script (Recommended)
The recommended approach is to use the enhanced-deploy.sh script in the version_selector project:

```bash
# Navigate to version_selector project
cd ../version_selector

# Run the enhanced deployment script
./enhanced-deploy.sh
```

This script:
- Builds all frontend applications (including defense)
- Copies the files to the correct directory structure
- Sets proper file content types
- Uploads to S3 with correct cache settings
- Invalidates the CloudFront cache

### Method 2: Manual Deployment
If you need to deploy only the defense frontend or troubleshoot deployment issues:

#### Step 1: Build the Defense Frontend
```bash
# In the frontend_defense directory
npm run build
```
This creates:
- `dist/public/` - Contains the built assets
- `dist/client/` - Contains the client-side application
- `dist/index.js` - Server-side component

#### Step 2: Copy Files to Version Selector
```bash
# Create defense directory in version_selector
mkdir -p ../version_selector/dist/defense

# Copy client files to version_selector
cp -r dist/client/* ../version_selector/dist/defense/
```

#### Step 3: Verify Correct Asset Paths
Ensure the index.html file has correct asset paths that include the `/defense/` prefix:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HandReceipt - Defense</title>
  <link rel="stylesheet" href="/defense/assets/index-[hash].css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/defense/assets/index-[hash].js"></script>
</body>
</html>
```

Replace `[hash]` with the actual filename hash from your build.

#### Step 4: Upload to S3
```bash
# From the version_selector directory
aws s3 sync dist/defense/ s3://www.handreceipt.com/defense/ --delete
```

#### Step 5: Set Correct Content Types
```bash
# Set HTML content type
aws s3 cp s3://www.handreceipt.com/defense/index.html s3://www.handreceipt.com/defense/index.html \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache" \
  --metadata-directive REPLACE

# Set CSS content type
aws s3 cp s3://www.handreceipt.com/defense/assets/index-[hash].css s3://www.handreceipt.com/defense/assets/index-[hash].css \
  --content-type "text/css" \
  --cache-control "max-age=31536000,public" \
  --metadata-directive REPLACE

# Set JavaScript content type
aws s3 cp s3://www.handreceipt.com/defense/assets/index-[hash].js s3://www.handreceipt.com/defense/assets/index-[hash].js \
  --content-type "application/javascript" \
  --cache-control "max-age=31536000,public" \
  --metadata-directive REPLACE

# Set font content types (if applicable)
aws s3 cp s3://www.handreceipt.com/defense/fonts/d-din.woff2 s3://www.handreceipt.com/defense/fonts/d-din.woff2 \
  --content-type "font/woff2" \
  --cache-control "max-age=31536000,public" \
  --metadata-directive REPLACE
```

#### Step 6: Add Index File at Root Defense Path
This ensures proper routing when accessing /defense without a trailing slash:
```bash
aws s3 cp s3://www.handreceipt.com/defense/index.html s3://www.handreceipt.com/defense \
  --content-type "text/html; charset=utf-8" \
  --cache-control "no-cache" \
  --metadata-directive REPLACE
```

#### Step 7: Invalidate CloudFront Cache
```bash
aws cloudfront create-invalidation \
  --distribution-id E3T7VX6HV95Q5O \
  --paths "/defense" "/defense/" "/defense/index.html" "/defense/*"
```

## Troubleshooting Common Issues

### Issue: Raw HTML Displayed Instead of Rendered Page
If you see raw HTML code displayed in the browser:

1. **Check Content Type**: Ensure index.html has the proper content type:
   ```bash
   aws s3api head-object --bucket www.handreceipt.com --key defense/index.html
   ```

2. **Fix Content Type**: If incorrect, update with:
   ```bash
   aws s3 cp s3://www.handreceipt.com/defense/index.html s3://www.handreceipt.com/defense/index.html \
     --content-type "text/html; charset=utf-8" \
     --cache-control "no-cache" \
     --metadata-directive REPLACE
   ```

3. **Create Simplified Index**: If issues persist, create a simplified index.html:
   ```bash
   echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HandReceipt - Defense</title><link rel="stylesheet" href="/defense/assets/index-[hash].css"></head><body><div id="root"></div><script type="module" src="/defense/assets/index-[hash].js"></script></body></html>' > fixed-index.html
   ```

   Then upload:
   ```bash
   aws s3 cp fixed-index.html s3://www.handreceipt.com/defense/index.html \
     --content-type "text/html; charset=utf-8" \
     --cache-control "no-cache" \
     --metadata-directive REPLACE
   ```

### Issue: Assets Not Loading
If the page loads but CSS, JavaScript, or fonts are missing:

1. **Check Asset Paths**: Ensure all paths in the HTML file include `/defense/` prefix.

2. **Verify Assets Exist in S3**:
   ```bash
   aws s3 ls s3://www.handreceipt.com/defense/assets/
   ```

3. **Check Content Types**: Ensure JS and CSS files have correct content types.

4. **Browser Inspection**: Use browser dev tools to identify specific 404 errors or content type issues.

### Issue: CloudFront Caching
If changes don't appear after deployment:

1. **Check Cache Headers**: Verify HTML files have no-cache and assets have long cache times.

2. **Perform Targeted Invalidation**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E3T7VX6HV95Q5O \
     --paths "/defense/index.html" "/defense/*"
   ```

3. **Wait for Propagation**: CloudFront updates can take 5-15 minutes to fully propagate.

## Best Practices

1. **Content Types**: Always set explicit content types when uploading:
   - HTML: `text/html; charset=utf-8`
   - CSS: `text/css`
   - JavaScript: `application/javascript`
   - Fonts: `font/woff2` (for .woff2 files)

2. **Cache Control**:
   - HTML files: `no-cache` to ensure latest content is always served
   - Static assets (JS, CSS, images, fonts): `max-age=31536000,public` for optimal performance

3. **Path Structure**:
   - Always use `/defense/` prefix in asset paths for production
   - Include both root defense path (without trailing slash) and directory index

4. **Testing**:
   - After deployment, test both paths:
     - www.handreceipt.com/defense
     - www.handreceipt.com/defense/
   - Test with cache cleared (Ctrl+F5 or Cmd+Shift+R)

5. **Backup**:
   - Before major changes, download current working files:
     ```bash
     aws s3 sync s3://www.handreceipt.com/defense/ ./defense-backup/
     ```

## Lessons Learned

1. **Content Type Is Critical**: The browser relies on content types to properly render files. Always explicitly set content types when uploading to S3.

2. **Path Consistency**: Maintain consistent path references between development and production.

3. **Root and Directory Index**: Both `/defense` and `/defense/` paths need proper HTML files for routing to work correctly.

4. **Multiple CloudFront Invalidations**: When troubleshooting, invalidate both specific files and path patterns.

5. **Build Output Structure**: Understanding the correct build output structure is essential - use `dist/client/*` files for frontend deployment.

6. **Simplified HTML Test**: A minimal valid HTML file can help isolate rendering issues from application code problems.

7. **Charset Specification**: Including `charset=utf-8` in content type headers prevents character encoding issues. 