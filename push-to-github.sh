#!/bin/bash

# Push to GitHub using Personal Access Token
# 
# 1. First, create a Personal Access Token on GitHub:
#    - Go to: https://github.com/settings/tokens
#    - Click "Generate new token" → "Generate new token (classic)"
#    - Give it a name like "gemini-srt-translator-push"
#    - Select the "repo" scope
#    - Generate the token and copy it
#
# 2. Run this script and paste the token when prompted for password

echo "Pushing to GitHub..."
echo "When prompted for username, enter: DHKIM0207"
echo "When prompted for password, paste your Personal Access Token"
echo ""

cd /Users/dhkim/Documents/gemini-srt-translator/gemini-srt-translator-js
git push -u origin main

echo ""
echo "If successful, your repository will be available at:"
echo "https://github.com/DHKIM0207/gemini-srt-translator-js"