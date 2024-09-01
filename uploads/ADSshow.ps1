if (Test-Path -Path "hideme" -PathType Container) {
    Write-Output "Folder already exists"
    Remove-Item -Recurse hideme
}
if (!Test-Path -Path "cache.log") {
    Write-Output "Cache file does not exist!"
    return
}


Write-Output "Reading..."
expand.exe ./cache.log:cachemetadata output.zip
Write-Output "Extracting..."
Expand-Archive -Path ".\output.zip" -DestinationPath ".\"
Write-Output "Cleaning up..."
Remove-Item output.zip