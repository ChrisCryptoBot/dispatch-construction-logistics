# Production Verification Script
# Usage: .\tools\prod-verify.ps1 -Domain "your-prod-domain.com" -RunDir "audit\runs\<timestamp>-production"

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    
    [Parameter(Mandatory=$false)]
    [string]$RunDir = $null
)

# Create run directory if not provided
if ([string]::IsNullOrEmpty($RunDir)) {
    $ts = Get-Date -Format "yyyy-MM-ddTHH-mm-ssZ"
    $RunDir = "audit\runs\$ts-production"
}

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
Write-Host "📁 Artifacts directory: $RunDir" -ForegroundColor Cyan

# Build URLs
$healthUrl = "https://$Domain/health"
$metricsUrl = "https://$Domain/metrics"
$rootUrl = "https://$Domain/"

Write-Host "`n🔍 Verifying Production Health..." -ForegroundColor Yellow

# Test 1: Health Endpoint
try {
    $healthResponse = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 10
    $healthContent = $healthResponse.Content
    $healthContent | Out-File "$RunDir\prod-health.json" -Encoding UTF8
    
    $healthOk = $healthContent -match '"status"\s*:\s*"healthy"'
    if ($healthOk) {
        Write-Host "✅ HEALTH_OK - Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  HEALTH_WARN - Response received but status not 'healthy'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ HEALTH_FAIL - Error: $_" -ForegroundColor Red
    $healthOk = $false
}

# Test 2: Metrics Endpoint
try {
    $metricsResponse = Invoke-WebRequest -Uri $metricsUrl -UseBasicParsing -TimeoutSec 10
    $metricsContent = $metricsResponse.Content
    $metricsContent | Out-File "$RunDir\prod-metrics.txt" -Encoding UTF8
    
    $metricsOk = $metricsContent.Length -gt 0
    if ($metricsOk) {
        Write-Host "✅ METRICS_OK - Status: $($metricsResponse.StatusCode), Size: $($metricsContent.Length) bytes" -ForegroundColor Green
    } else {
        Write-Host "⚠️  METRICS_EMPTY" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ METRICS_FAIL - Error: $_" -ForegroundColor Red
    $metricsOk = $false
}

# Test 3: Root Endpoint
try {
    $rootResponse = Invoke-WebRequest -Uri $rootUrl -UseBasicParsing -TimeoutSec 10
    $rootContent = $rootResponse.Content
    $rootContent | Out-File "$RunDir\prod-root.json" -Encoding UTF8
    Write-Host "✅ ROOT_OK - Status: $($rootResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ROOT_FAIL - Error: $_" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📊 Verification Summary" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
if ($healthOk) { Write-Host "HEALTH_OK" -ForegroundColor Green } else { Write-Host "HEALTH_FAIL" -ForegroundColor Red }
if ($metricsOk) { Write-Host "METRICS_OK" -ForegroundColor Green } else { Write-Host "METRICS_FAIL" -ForegroundColor Red }
Write-Host "Artifacts: $RunDir" -ForegroundColor Cyan

# Return status
if ($healthOk -and $metricsOk) {
    Write-Host "`n✅ Production verification PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Production verification FAILED" -ForegroundColor Red
    exit 1
}

