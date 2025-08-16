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
  const repoUrl = process.env.NEXT_PUBLIC_REPO_URL || '';
  const branch = process.env.NEXT_PUBLIC_REPO_BRANCH || 'main';
  let ownerRepo = {};
  if (repoUrl) ownerRepo = parseOwnerRepo(repoUrl);
  const data = transformBadges(raw, { branch, ...ownerRepo });
  const outDir = path.join(cwd, 'lib', 'generated');
  const outFile = path.join(outDir, 'readme-badges.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log(`[badges] Wrote ${outFile} (${data.length} badges)`);
}

main();

