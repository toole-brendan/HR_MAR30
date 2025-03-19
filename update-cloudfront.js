import fs from 'fs';
import { execSync } from 'child_process';

console.log('Getting current CloudFront configuration...');
const currentConfig = JSON.parse(execSync('aws cloudfront get-distribution-config --id E3T7VX6HV95Q5O').toString());

// Store the ETag for the update request
const etag = currentConfig.ETag;

// Get the current distribution config
const distConfig = currentConfig.DistributionConfig;

// Check if there are custom error responses
if (!distConfig.CustomErrorResponses) {
  distConfig.CustomErrorResponses = {
    Quantity: 0,
    Items: []
  };
}

// Find the existing 404 error response
const existing404Response = distConfig.CustomErrorResponses.Items.find(
  item => item.ErrorCode === 404
);

if (existing404Response) {
  console.log('Updating existing 404 error response...');
  console.log(`Current ResponsePagePath: ${existing404Response.ResponsePagePath}`);
  
  // Create a copy of the existing configuration
  const updatedConfig = JSON.parse(JSON.stringify(distConfig));
  
  // Find and update the 404 error response in the copy
  const updatedErrorResponse = updatedConfig.CustomErrorResponses.Items.find(
    item => item.ErrorCode === 404
  );
  
  // Make sure to keep all properties, just update the ResponsePagePath
  updatedErrorResponse.ResponsePagePath = '/defense/app.html';
  
  console.log(`New ResponsePagePath: ${updatedErrorResponse.ResponsePagePath}`);
  
  // Save updated config to a file
  const tempConfigFile = 'updated-cloudfront-config.json';
  fs.writeFileSync(tempConfigFile, JSON.stringify({
    DistributionConfig: updatedConfig
  }, null, 2));
  
  // Update the CloudFront distribution
  console.log('Updating CloudFront distribution...');
  try {
    execSync(`aws cloudfront update-distribution --id E3T7VX6HV95Q5O --if-match "${etag}" --cli-input-json file://${tempConfigFile}`);
    console.log('CloudFront distribution update initiated successfully.');
    console.log('The update may take 5-10 minutes to fully deploy.');
  } catch (error) {
    console.error('Error updating CloudFront distribution:', error.toString());
  }
} else {
  console.log('No existing 404 error response found to update.');
}
