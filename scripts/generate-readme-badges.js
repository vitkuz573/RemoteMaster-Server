#!/usr/bin/env node
// Generate lib/generated/readme-badges.json from README.md
// Parses badges between <!-- badges:start --> and <!-- badges:end -->
// and rewrites known providers to shields.io for reliable embedding.

const fs = require('fs');
const path = require('path');

function extractBadges(md) {
  const block = md.match(/<!--\s*badges:start\s*-->[\s\S]*?<!--\s*badges:end\s*-->/i);
  if (!block) return [];
  const chunk = block[0];
  const out = [];
  const reLinked = /\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)/g;
  const rePlain = /!\[(.*?)\]\((.*?)\)/g;
  let m;
  while ((m = reLinked.exec(chunk))) {
    const [, alt, src, href] = m;
    out.push({ alt, src, href });
  }
  while ((m = rePlain.exec(chunk))) {
    const [, alt, src] = m;
    if (!out.some((b) => b.src === src)) out.push({ alt, src });
  }
  return out;
}

function parseOwnerRepo(repoUrl) {
  try {
    const u = new URL(repoUrl);
    if (u.hostname !== 'github.com') return {};
    const [owner, repo] = u.pathname.replace(/^\//, '').split('/');
    return { owner, repo };
  } catch {
    return {};
  }
}

function transformBadges(list, { owner, repo, branch }) {
  return list.map((b) => {
    try {
      const u = new URL(b.src);
      // GitHub Actions badge.svg
      if (u.hostname === 'github.com' && /\/actions\/workflows\/.+\/badge\.svg$/.test(u.pathname) && owner && repo) {
        const workflow = u.pathname.split('/').slice(-2, -1)[0];
        return {
          alt: b.alt || 'CI',
          src: `https://img.shields.io/github/actions/workflow/status/${owner}/${repo}/${workflow}?branch=${encodeURIComponent(branch)}`,
          href: b.href,
        };
      }
      // Codecov -> shields
      if (u.hostname === 'codecov.io' && /\/gh\/.+\/branch\/.+\/graph\/badge\.svg$/.test(u.pathname) && owner && repo) {
        return {
          alt: b.alt || 'codecov',
          src: `https://img.shields.io/codecov/c/github/${owner}/${repo}/${encodeURIComponent(branch)}`,
          href: b.href,
        };
      }
    } catch {}
    return b;
  });
}

function main() {
  const cwd = process.cwd();
  const readmePath = path.join(cwd, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.warn('[badges] README.md not found');
    return;
  }
  const md = fs.readFileSync(readmePath, 'utf8');
  const raw = extractBadges(md);
  // Try to load .env.local for repo metadata if not present in env
  try {
    const envLocal = path.join(cwd, '.env.local');
    if (fs.existsSync(envLocal)) {
      const lines = fs.readFileSync(envLocal, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
      }
    }
  } catch {}

  let repoUrl = process.env.NEXT_PUBLIC_REPO_URL || '';
  let branch = process.env.NEXT_PUBLIC_REPO_BRANCH || 'main';
  // Derive owner/repo from env or directly from badges
  let ownerRepo = repoUrl ? parseOwnerRepo(repoUrl) : {};
  if (!ownerRepo.owner || !ownerRepo.repo) {
    for (const b of raw) {
      try {
        const src = (b.src || '') + ' ' + (b.href || '');
        let m = src.match(/github\.com\/([^\/]+)\/([^\/]+)\/actions\/workflows\//);
        if (m) { ownerRepo = { owner: m[1], repo: m[2] }; break; }
        m = src.match(/codecov\.io\/gh\/([^\/]+)\/([^\/]+)/);
        if (m) { ownerRepo = { owner: m[1], repo: m[2] }; break; }
      } catch {}
    }
  }
  // Derive branch from codecov badge if present
  for (const b of raw) {
    const src = b.src || '';
    const m = src.match(/branch\/([^\/]+)\/graph\/badge\.svg/);
    if (m) { branch = m[1]; break; }
  }

  const data = transformBadges(raw, { branch, ...ownerRepo });
  const outDir = path.join(cwd, 'lib', 'generated');
  const outFile = path.join(outDir, 'readme-badges.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log(`[badges] Wrote ${outFile} (${data.length} badges)`);
}

main();
