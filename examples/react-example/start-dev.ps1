# React Example 开发服务器启动脚本
Write-Host "🚀 启动 @ldesign/chart React 示例..." -ForegroundColor Green
Write-Host "📁 当前目录: $PWD" -ForegroundColor Cyan

# 检查依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    pnpm install
}

# 检查父包构建产物
if (-not (Test-Path "..\..\es\index.js")) {
    Write-Host "⚠️  父包未构建，正在构建..." -ForegroundColor Yellow
    Push-Location ..\..
    pnpm build
    Pop-Location
}

# 启动开发服务器
Write-Host "🌐 启动开发服务器..." -ForegroundColor Green
Write-Host "📍 访问地址: http://localhost:5173" -ForegroundColor Cyan
pnpm dev



