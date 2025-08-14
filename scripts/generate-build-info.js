#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

/**
 * Small helper to run a command safely and return trimmed stdout or null
 */
function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], cwd: ROOT }).trim();
  } catch {
    return null;
  }
}

/**
 * Derive git/CI metadata in a robust, CI-aware way
 */
function resolveVcsMeta() {
  // Prefer CI-provided envs first
  const ciSha = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.CI_COMMIT_SHA || null;
  const ciRef = process.env.GITHUB_REF_NAME || process.env.VERCEL_GIT_COMMIT_REF || process.env.CI_COMMIT_REF_NAME || null;
  const ciTag = process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : (process.env.CI_COMMIT_TAG || null);

  // Fallback to git CLI
  const fullSha = ciSha || sh('git rev-parse HEAD');
  const shortSha = (ciSha && ciSha.slice(0, 7)) || sh('git rev-parse --short HEAD');
  const branch = ciRef || sh('git rev-parse --abbrev-ref HEAD');
  const tag = ciTag || sh('git describe --tags --abbrev=0');
  const dirty = (() => {
    const s = sh('git status --porcelain');
    return s ? s.length > 0 : false;
  })();
  const commitDate = sh('git show -s --format=%cI') || null;
  const remoteUrl = sh('git remote get-url origin');

  return {
    fullSha: fullSha || 'unknown',
    shortSha: shortSha || (fullSha ? String(fullSha).slice(0, 7) : 'unknown'),
    branch: branch || 'unknown',
    tag: tag || null,
    dirty,
    commitDate,
    remoteUrl: remoteUrl || null,
    ci: Boolean(process.env.CI),
    ciProvider: process.env.GITHUB_ACTIONS ? 'github' : process.env.VERCEL ? 'vercel' : process.env.GITLAB_CI ? 'gitlab' : null,
  };
}

/**
 * Merge or insert specific lines into an .env-like file while preserving others
 */
function upsertEnvFile(filePath, entries) {
  const header = '# Auto-generated build info (do not edit build keys manually)';
  const lines = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').split(/\r?\n/) : [];
  const map = new Map();
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) map.set(m[1], m[2]);
  }
  for (const [k, v] of Object.entries(entries)) {
    map.set(k, String(v));
  }
  const result = [header, ...Array.from(map.entries()).map(([k, v]) => `${k}=${v}`)].join(os.EOL) + os.EOL;
  fs.writeFileSync(filePath, result, 'utf8');
}

/**
 * Generate build information and write both JSON and env vars
 */
function generateBuildInfo() {
  try {
    const cwd = ROOT;
    const now = new Date();
    const buildTime = now.toISOString();
    const buildDate = buildTime.split('T')[0];
    const timestamp = now.getTime();

    // Load package.json to extract name/version/deps
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    const appName = pkg.name || 'app';
    const appVersion = pkg.version || '0.0.0';
    const nextVersion = (pkg.dependencies && pkg.dependencies.next) || null;

    // VCS metadata
    const vcs = resolveVcsMeta();

    // Build info object (extendable without breaking consumers)
    const buildInfo = {
      name: appName,
      version: appVersion,
      buildDate,
      buildTime,
      timestamp,
      nodeVersion: process.version,
      nextVersion,
      commit: {
        hash: vcs.fullSha,
        short: vcs.shortSha,
        date: vcs.commitDate,
        branch: vcs.branch,
        tag: vcs.tag,
        dirty: vcs.dirty,
        remote: vcs.remoteUrl,
      },
      ci: {
        isCI: vcs.ci,
        provider: vcs.ciProvider,
        runNumber: process.env.GITHUB_RUN_NUMBER || process.env.CI_PIPELINE_IID || null,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    // Write/merge env values (non-destructive to other vars)
    const envPath = path.join(cwd, '.env.local');
    upsertEnvFile(envPath, {
      NEXT_PUBLIC_APP_VERSION: appVersion,
      NEXT_PUBLIC_BUILD_DATE: buildDate,
      NEXT_PUBLIC_BUILD_TIME: buildTime,
      NEXT_PUBLIC_BUILD_HASH: buildInfo.commit.short,
      NEXT_PUBLIC_BUILD_BRANCH: buildInfo.commit.branch,
      NEXT_PUBLIC_BUILD_TIMESTAMP: String(timestamp),
    });

    // Write JSON summary for diagnostics
    fs.writeFileSync(
      path.join(cwd, 'build-info.json'),
      JSON.stringify(buildInfo, null, 2),
      'utf8'
    );

    // Pretty log
    const parts = [
      `📦 ${appName}@${appVersion}`,
      `🔗 ${buildInfo.commit.short}${buildInfo.commit.branch && buildInfo.commit.branch !== 'HEAD' ? '@' + buildInfo.commit.branch : ''}`,
      `⏰ ${buildTime}`,
    ];
    console.log('✅ Build info generated');
    console.log('   ' + parts.join('  •  '));
    console.log('   Files: .env.local, build-info.json');
  } catch (error) {
    console.error('❌ Error generating build info:', error && error.message ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateBuildInfo();
}

module.exports = { generateBuildInfo };
