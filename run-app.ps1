# Starts the frontend dev server on a free port.
# Avoids CRA prompt: "Something is already running on port 3000."

$ErrorActionPreference = "Stop"

$repoRoot = "c:/Users/i.t care/Desktop/role-based-auth-system"
$frontendPath = Join-Path $repoRoot "frontend"

$portsToTry = @(3000, 3001, 3002, 3003)

function Test-PortFree {
  param([int]$Port)
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    $listener.Stop()
    return $true
  } catch {
    return $false
  }
}

foreach ($p in $portsToTry) {
  if (Test-PortFree -Port $p) {
    Write-Host "Starting frontend on port $p ..."
    $env:PORT = $p
    Set-Location $frontendPath
    npm start
    exit 0
  }
}

throw "No free ports available among: $($portsToTry -join ', ')"

