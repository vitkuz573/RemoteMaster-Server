# 🚀 Dynamic Build Information System

This project uses a dynamic build information system that automatically generates build metadata during development and production builds.

## 📋 Overview

Instead of static build dates, the system automatically generates:
- **Build Date**: Current date when the build is created
- **Build Time**: Exact timestamp of the build  
- **Git Hash**: Short commit hash of the current build
- **Git Branch**: Branch name being built
- **Build Timestamp**: Unix timestamp for programmatic use

## 🔧 How it Works

### 1. Build Script
The `scripts/generate-build-info.js` script:
- Extracts git information (hash, branch)
- Generates current timestamp  
- Creates `.env.local` for Next.js environment variables
- Creates `build-info.json` for server-side usage

### 2. Automatic Integration
Build info is generated automatically:
```bash
npm run dev     # Generates build info, then starts dev server
npm run build   # Generates build info, then builds for production
npm run build:info  # Only generates build info
```

### 3. Usage in Code
```typescript
import { appConfig } from '@/lib/app-config';

// Access build information
console.log(appConfig.buildDate);     // "2024-01-15"
console.log(appConfig.buildTime);     // "2024-01-15T10:30:45.123Z"
console.log(appConfig.buildHash);     // "abc1234"
console.log(appConfig.buildBranch);   // "feature/new-ui"
console.log(appConfig.buildVersion);  // "2.1.4-dev" (in development)
console.log(appConfig.buildInfo);     // "abc1234@feature/new-ui"
```

## 📁 Generated Files

### `.env.local`
Environment variables for Next.js client-side usage:
```bash
# Auto-generated build info - DO NOT EDIT MANUALLY
NEXT_PUBLIC_BUILD_DATE=2024-01-15
NEXT_PUBLIC_BUILD_TIME=2024-01-15T10:30:45.123Z
NEXT_PUBLIC_BUILD_HASH=abc1234
NEXT_PUBLIC_BUILD_BRANCH=main
NEXT_PUBLIC_BUILD_TIMESTAMP=1705312245123
```

### `build-info.json`
JSON file for server-side or external tool usage:
```json
{
  "buildDate": "2024-01-15",
  "buildTime": "2024-01-15T10:30:45.123Z",
  "gitHash": "abc1234",
  "gitBranch": "main", 
  "nodeVersion": "v20.17.0",
  "timestamp": 1705312245123
}
```

## 🎯 Footer Display

The footer automatically shows:
- **Development**: `v2.1.4-dev` + `DEV` badge
- **Production**: `v2.1.4`
- **Build Info**: `Build: 2024-01-15 • abc1234@main`

## ⚠️ Important Notes

1. **Git Required**: The script requires git to extract commit information
2. **Auto-Generated**: Both `.env.local` and `build-info.json` are auto-generated
3. **Git Ignore**: These files should not be committed to the repository
4. **CI/CD**: Ensure the script runs in your CI/CD pipeline before builds

## 🔄 CI/CD Integration

For production builds, ensure your CI/CD pipeline runs:
```bash
node scripts/generate-build-info.js
npm run build
```

This ensures build information reflects the actual deployment time and commit.

## 🛠️ Customization

To modify build information, edit:
- `scripts/generate-build-info.js` - Build generation logic
- `lib/app-config.ts` - Configuration structure  
- `components/ui/footer.tsx` - Display formatting

## 📊 Benefits

✅ **Accurate Build Tracking**: Real build timestamps, not static dates  
✅ **Git Integration**: Automatic commit hash and branch detection  
✅ **Development vs Production**: Different versioning for different environments  
✅ **Debugging**: Easy to identify which build is running  
✅ **Professional**: Enterprise-grade build information display