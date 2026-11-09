# Explicit first-admin setup. Never save or echo the password; restore the caller's environment.
$ErrorActionPreference = 'Stop'
$adminEnvironmentNames = @('ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_CPF', 'ADMIN_PASSWORD')
$previousAdminEnvironment = @{}
foreach ($adminEnvironmentName in $adminEnvironmentNames) {
    $previousAdminEnvironment[$adminEnvironmentName] = [Environment]::GetEnvironmentVariable($adminEnvironmentName, 'Process')
}
try {
    $env:ADMIN_NAME = Read-Host 'Nome do primeiro administrador'
    $env:ADMIN_EMAIL = Read-Host 'E-mail do primeiro administrador'
    $env:ADMIN_CPF = Read-Host 'CPF do administrador (11 digitos)'
    $adminSecurePassword = Read-Host 'Senha (12 caracteres ou mais, ate 72 bytes UTF-8)' -AsSecureString
    $env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminSecurePassword).Password
    Push-Location (Split-Path $PSScriptRoot -Parent)
    try {
        & .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=dev,bootstrap-admin'
        if ($LASTEXITCODE -ne 0) { throw 'A inicializacao nao foi concluida; confira a configuracao local.' }
    } finally {
        Pop-Location
    }
} finally {
    foreach ($adminEnvironmentName in $adminEnvironmentNames) {
        [Environment]::SetEnvironmentVariable($adminEnvironmentName, $previousAdminEnvironment[$adminEnvironmentName], 'Process')
    }
    if ($null -ne $adminSecurePassword) { $adminSecurePassword.Dispose() }
}
