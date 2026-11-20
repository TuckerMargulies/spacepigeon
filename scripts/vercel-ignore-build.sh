#!/usr/bin/env bash
# Vercel "Ignored Build Step" script.
#
# Vercel convention is inverted: exit 0 = SKIP build, exit 1 = RUN build.
# Wired up through "ignoreCommand" in vercel.json:
#   bash scripts/vercel-ignore-build.sh
#
# Skips a Vercel build when:
#   1. The branch is from Dependabot (patch bumps don't need a preview)
#   2. Every changed file is docs/config/test-only (no runtime impact)
#
# Builds otherwise — including when the diff can't be computed for any reason.
#
# The diff runs against the last commit Vercel deployed on this branch
# (VERCEL_GIT_PREVIOUS_SHA), not HEAD^: a push can carry several commits, and
# HEAD^ of a merge commit can already contain the code, which made the diff
# look empty and skipped real changes. No previous deploy, or the commit is
# not in Vercel's shallow clone → build.

set -euo pipefail

if [[ "${VERCEL_GIT_COMMIT_REF:-}" == dependabot/* ]]; then
  echo "Dependabot branch (${VERCEL_GIT_COMMIT_REF}) — skipping build."
  exit 0
fi

BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [[ -z "$BASE" ]] || ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  echo "No previous deployment to compare with on ${VERCEL_GIT_COMMIT_REF:-unknown} — building."
  exit 1
fi

if git diff --quiet "$BASE" HEAD -- \
  ':(exclude)*.md' \
  ':(exclude)**/*.md' \
  ':(exclude).claude' \
  ':(exclude)docs' \
  ':(exclude).github' \
  ':(exclude)e2e' \
  ':(exclude)tests' \
  ':(exclude)supabase' \
  ':(exclude)playwright.config.mjs' \
  ':(exclude)scripts/check.mjs' 2>/dev/null; then
  echo "Docs/config-only changes on ${VERCEL_GIT_COMMIT_REF:-unknown} — skipping build."
  exit 0
fi

echo "Code changes detected on ${VERCEL_GIT_COMMIT_REF:-unknown} — building."
exit 1
