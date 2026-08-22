$gitDir = "C:\Users\USER\AppData\Local\Programs\Git\cmd"
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$gitDir*") {
    $newPath = "$currentPath;$gitDir"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Added $gitDir to User PATH permanently."
} else {
    Write-Host "Git path is already in User PATH."
}

$env:Path = "$env:Path;$gitDir"
Write-Host "Testing Git execution:"
& "$gitDir\git.exe" --version
