param (
    [Parameter(Mandatory=$true)]
    [string]$FolderName,
    [Parameter(Mandatory=$true)]
    [int]$HiddenByteAmount,
    [Parameter(Mandatory=$true)]
    [int]$FileAmount
)

if ($FolderName -eq $null) {
    Write-Output "Folder name not specified... Using tmp"
    $FolderName = "tmp"
}
if ($HiddenByteAmount -eq $null) {
    Write-Output "Hidden bytes not specified... Using 1000000"
    $HiddenByteAmount = 1000000
}
if ($FileAmount -eq $null) {
    Write-Output "File amount  not specified... Using 30"
    $FileAmount = 30
}
    

$byteCount = 200

if (-not (Test-Path -Path $FolderName -PathType Container)) {
    Write-Host "Provided folder does not exist. Creating folder..."
    New-Item -Path $FolderName -ItemType Directory
}

function WriteRandomBytes {
    param(
        [string] $FileName
    )
    $randomByteCount = $byteCount + (Get-Random -Minimum 20 -Maximum 300)
    $random = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $bytes = New-Object byte[] $randomByteCount
    $random.GetBytes($bytes)

    # Write the bytes to a file
    [System.IO.File]::WriteAllBytes("$FolderName\$FileName", $bytes)

    Write-Host "$randomByteCount bytes written to $FileName"
    Write-Host "Writing $HiddenByteAmount hidden bytes to $FileName"
    Set-Content -Path "$FolderName\$FileName" -Stream "hiddendata" -Value ("DruUgs"*$HiddenByteAmount)
}

for ($i = 0; $i -le $FileAmount; $i++) {
    WriteRandomBytes -FileName "$(Get-Random -Minimum 10000 -Maximum 99999)-cache-chrome.exe.log"
}