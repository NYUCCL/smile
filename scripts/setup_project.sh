#!/bin/bash

####
# These things need to run from any fresh clone of the repo
###

echo "Installing dependencies"
npm install

echo "Adding symbolic link for local post-commit hook"
chmod +x scripts/generate_git_env.sh
ln -sf ../../scripts/generate_git_env.sh .git/hooks/post-commit
# same thing but for when you switch to a new branch
ln -sf ../../scripts/generate_git_env.sh .git/hooks/post-checkout
bash scripts/generate_git_env.sh

echo "Building Bulma CSS"
npm run css-build