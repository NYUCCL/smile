#!/bin/bash
set -e

REPO="codec-lab/smile-secrets"

echo "Fetching .env files from $REPO..."

for file in .env.deploy.local .env.docs.local .env.local; do
  gh api "repos/$REPO/contents/$file" --jq '.content' | base64 -d > "env/$file"
  echo "Downloaded: $file"
done

echo "Done."
