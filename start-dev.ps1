# 开发服务器启动脚本
Write-Host "=== DLZ Shop CMS 开发环境启动 ===" -ForegroundColor Green

# 检查 pnpm 是否安装
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: pnpm 未安装，正在安装..." -ForegroundColor Red
    npm install -g pnpm
}

# 检查依赖是否安装完成
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    pnpm install
}

# 等待当前的 npm install 完成
Write-Host "等待依赖安装完成..." -ForegroundColor Yellow
while (Get-Process -Name node -ErrorAction SilentlyContinue) {
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
}
Write-Host ""

# 检查环境文件
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "创建 API 环境文件..." -ForegroundColor Yellow
    Copy-Item "apps/api/.env.example" "apps/api/.env" -ErrorAction SilentlyContinue
}

if (-not (Test-Path "apps/web/.env")) {
    Write-Host "创建 Web 环境文件..." -ForegroundColor Yellow
    Copy-Item "apps/web/.env.example" "apps/web/.env" -ErrorAction SilentlyContinue
}

# 初始化数据库
Write-Host "初始化数据库..." -ForegroundColor Yellow
Set-Location "apps/api"
if (Test-Path "package.json") {
    pnpm prisma generate 2>$null
    pnpm prisma migrate dev --name init 2>$null
}
Set-Location "../.."

Write-Host "启动开发服务器..." -ForegroundColor Green
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:3001" -ForegroundColor Cyan

# 启动开发服务器
pnpm dev