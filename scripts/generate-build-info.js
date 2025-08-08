#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generate build information
 * This script creates build metadata that can be used in the application
 */
function generateBuildInfo() {
  try {
    // Get current timestamp
    const buildTime = new Date().toISOString();
    const buildDate = buildTime.split('T')[0];
    
    // Get git hash if available
    let gitHash = 'unknown';
    let gitBranch = 'unknown';
    
    try {
      gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      console.warn('Git not available, using fallback values');
    }
    
    // Build info object
    const buildInfo = {
      buildDate,
      buildTime,
      gitHash,
      gitBranch,
      nodeVersion: process.version,
      timestamp: Date.now()
    };
    
    // Create .env.local file with build info
    const envContent = `# Auto-generated build info - DO NOT EDIT MANUALLY
NEXT_PUBLIC_BUILD_DATE=${buildDate}
NEXT_PUBLIC_BUILD_TIME=${buildTime}
NEXT_PUBLIC_BUILD_HASH=${gitHash}
NEXT_PUBLIC_BUILD_BRANCH=${gitBranch}
NEXT_PUBLIC_BUILD_TIMESTAMP=${buildInfo.timestamp}
`;

    // Write to .env.local
    fs.writeFileSync(path.join(__dirname, '../.env.local'), envContent);
    
    // Also create a JSON file for server-side usage
    fs.writeFileSync(
      path.join(__dirname, '../build-info.json'), 
      JSON.stringify(buildInfo, null, 2)
    );
    
    console.log('✅ Build info generated successfully:');
    console.log(`   📅 Build Date: ${buildDate}`);
    console.log(`   ⏰ Build Time: ${buildTime}`);
    console.log(`   🔗 Git Hash: ${gitHash}`);
    console.log(`   🌿 Git Branch: ${gitBranch}`);
    console.log(`   📁 Files: .env.local, build-info.json`);
    
  } catch (error) {
    console.error('❌ Error generating build info:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateBuildInfo();
}

module.exports = { generateBuildInfo };