#!/bin/bash
set -e

REPO="codec-lab/smile-secrets"

echo "Fetching .env files from $REPO..."

for file in .env.deploy.local .env.docs.local .env.local; do
  gh api "repos/$REPO/contents/$file" --jq '.content' | base64 -d > "env/$file"
  echo "Downloaded: $file"
done

echo "Fetching service account key..."
gh api "repos/$REPO/contents/.service-account-key.json" --jq '.content' | base64 -d > "firebase/.service-account-key.json"
echo "Downloaded: .service-account-key.json"

echo "Fetching lab scripts..."
gh api "repos/$REPO/contents/get_recruitment_data.mjs" --jq '.content' | base64 -d > "scripts/get_recruitment_data.mjs"
echo "Downloaded: get_recruitment_data.mjs"

echo "Done."
