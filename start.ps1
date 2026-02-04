# ThoughtFlow 启动脚本 (PowerShell)
# 编码设置
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ThoughtFlow 启动脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 切换到脚本所在目录
Set-Location $PSScriptRoot

Write-Host "[1/3] 检查环境..." -ForegroundColor Yellow
Write-Host ""

# 检查 Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未检测到 Python，请先安装 Python 3.8+" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 检查 Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未检测到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host ""
Write-Host "[2/3] 启动后端服务 (端口: 13089)..." -ForegroundColor Yellow
Write-Host ""

# 启动后端
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Host "首次运行，正在创建虚拟环境..." -ForegroundColor Cyan
    python -m venv venv
    & "venv\Scripts\Activate.ps1"
    Write-Host "正在安装后端依赖..." -ForegroundColor Cyan
    pip install -r requirements.txt
} else {
    & "venv\Scripts\Activate.ps1"
}

$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 13089 --reload" -PassThru
Write-Host "✓ 后端服务已启动 (进程 ID: $($backendJob.Id))" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "[3/3] 启动前端服务 (端口: 3089)..." -ForegroundColor Yellow
Write-Host ""

# 启动前端
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "首次运行，正在安装前端依赖..." -ForegroundColor Cyan
    npm install
}

$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -PassThru
Write-Host "✓ 前端服务已启动 (进程 ID: $($frontendJob.Id))" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  启动完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "后端地址: " -NoNewline
Write-Host "http://localhost:13089" -ForegroundColor Cyan
Write-Host "API 文档: " -NoNewline
Write-Host "http://localhost:13089/docs" -ForegroundColor Cyan
Write-Host "前端地址: " -NoNewline
Write-Host "http://localhost:3089" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 关闭后端/前端的窗口可停止对应服务" -ForegroundColor Yellow
Write-Host ""
Read-Host "按 Enter 退出此脚本 (服务将继续运行)"
