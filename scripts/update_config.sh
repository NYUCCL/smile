#!/bin/bash


url=$(git config --get remote.origin.url)

repo_path=$(echo "$url" | sed -E 's|.*/([^/]+)/([^/.]+)(\.git)?|\1/\2|')


# update the app configs using a base64 encoding of
# all the variables
# Note: Use tr -d '\n' to remove line breaks for cross-platform compatibility
# (Linux base64 adds newlines by default, macOS doesn't)
ENC=$(cat env/.env.local | base64 | tr -d '\n')
gh secret set SECRET_APP_CONFIG --body "$ENC" --repo $repo_path


# update doc secrets (these go one variable at a time)
# only do this if repo name is nyuccl/docs
re="^(https|git)(:\/\/|@)([^\/:]+)[\/:]([^\/:]+)\/(.+)(.git)*$"

if [[ $url =~ $re ]]; then    
    protocol=${BASH_REMATCH[1]}
    separator=${BASH_REMATCH[2]}
    hostname=${BASH_REMATCH[3]}
    user=${BASH_REMATCH[4]}
    repo=${BASH_REMATCH[5]}
fi

if [[ "$user/$repo" == "NYUCCL/smile.git" ]]
then
    gh secret set -f env/.env.docs.local
fi

# update deploy secrets (these go one variable at a time)
gh secret set -f env/.env.deploy.local --repo $repo_path