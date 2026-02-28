# APIARY INITIALIZER - Ticket #050
# Minimalist ASCII Version

Write-Host "Initializing Apiary SDLC Ecosystem..."

# 1. Create Internal Architecture
$folders = @(
    "src/core",
    "src/components",
    "src/features/triage",
    "src/features/history",
    "src/features/sandbox",
    "src/hooks"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force
    }
}

Write-Host "Success: Domain Folders Created."

# 2. Generate Firebase Configuration Guide
$line1 = "--- FIREBASE SETUP GUIDE ---"
$line2 = "1. Go to Firebase Console -> Cloud Firestore."
$line3 = "2. Create Collection: reports"
$line4 = "3. Create Collection: backlog_ideas"
$line5 = "4. Create Collection: tickets"
$line6 = "5. Rules: allow read, write: if request.auth != null;"

$guide = "$line1`n$line2`n$line3`n$line4`n$line5`n$line6"
$guide | Out-File -FilePath "FIREBASE_SETUP_GUIDE.md"

Write-Host "Setup Guide generated. Ready for code."