# Script to push monster model files to GitHub
# This script uses environment variables for authentication

# Check if GITHUB_TOKEN environment variable is set
if (-not $env:GITHUB_TOKEN) {
    # Prompt for GitHub token if not set as environment variable
    $token = Read-Host "Enter your GitHub token" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    $env:GITHUB_TOKEN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

# Set the GitHub username
$username = "coinerd"  # Replace with your GitHub username if different

# Configure Git to use the token for authentication
git config --local credential.helper ""
$remote = "https://${username}:$env:GITHUB_TOKEN@github.com/coinerd/monster-merge-chaos-arena-game.git"
git remote set-url origin $remote

# Push changes to GitHub
Write-Host "Pushing changes to GitHub..."
git push origin main

# Reset the remote URL to remove the token (for security)
git remote set-url origin "https://github.com/coinerd/monster-merge-chaos-arena-game.git"

Write-Host "Monster model files have been successfully pushed to GitHub!"
