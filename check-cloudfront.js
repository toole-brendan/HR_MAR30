import { execSync } from 'child_process';

console.log('Checking CloudFront distribution status...');
try {
  const status = JSON.parse(execSync('aws cloudfront get-distribution --id E3T7VX6HV95Q5O').toString());
  const distributionStatus = status.Distribution.Status;
  const lastModified = status.Distribution.LastModifiedTime;
  
  console.log(`Distribution Status: ${distributionStatus}`);
  console.log(`Last Modified: ${lastModified}`);
  
  if (distributionStatus === "Deployed") {
    console.log('\nDistribution is fully deployed. Your site should be working correctly now.');
    console.log('You can verify by visiting: https://www.handreceipt.com/defense/');
  } else {
    console.log('\nDistribution is still deploying. Please wait a few more minutes.');
    console.log('You can run this script again to check the status.');
  }
} catch (error) {
  console.error('Error checking CloudFront status:', error.toString());
}
