#!/bin/bash

# Alternative: Create a new SSH key without passphrase for GitHub

echo "This script will help you create a new SSH key without passphrase for GitHub"
echo ""

# Generate new key
echo "1. Generating new SSH key..."
ssh-keygen -t ed25519 -C "donghyunkim.me@gmail.com" -f ~/.ssh/id_ed25519_github -N ""

# Add to SSH config
echo "2. Adding to SSH config..."
cat >> ~/.ssh/config << EOF

Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
EOF

# Display public key
echo ""
echo "3. Copy this public key and add it to GitHub:"
echo "   Go to: https://github.com/settings/keys"
echo "   Click 'New SSH key'"
echo "   Title: gemini-srt-translator-js"
echo "   Key:"
cat ~/.ssh/id_ed25519_github.pub

echo ""
echo "4. After adding the key to GitHub, test with:"
echo "   ssh -T git@github.com"

echo ""
echo "5. Then switch back to SSH and push:"
echo "   cd /Users/dhkim/Documents/gemini-srt-translator/gemini-srt-translator-js"
echo "   git remote set-url origin git@github.com:DHKIM0207/gemini-srt-translator-js.git"
echo "   git push -u origin main"