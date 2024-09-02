$folderExists = Test-Path -Path "hideme" -PathType Container
if (-not $folderExists) {
    Write-Output "Folder dosen't exist"
    New-Item -Path "hideme" -ItemType Directory
    Set-Content -Path "hideme\README.txt" -Value "This folder is hidden in cache.log \n - DruUg"
}
$fileExists = Test-Path -Path "cache.log"
if (-not $fileExists) {
    Write-Output "File dosen't exist"
    Set-Content -Path "cache.log" -Value "CACHE"
}
Get-Content -Path "cache.log" -Stream * -ErrorAction Ignore

Write-Output "Compressing..."
Compress-Archive -Path "hideme" -DestinationPath "hideme.zip"
Write-Output "Writing..."
Get-Content hideme.zip -Raw | Set-Content cache.log -Stream cachemetadata
Write-Output "Cleaning..."
Remove-Item hideme.zip
Remove-Item -Recurse hideme