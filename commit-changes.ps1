# Git提交脚本
Write-Host "正在提交Git更改..." -ForegroundColor Green

# 切换到项目目录
Set-Location $PSScriptRoot

# 添加所有文件
Write-Host "添加所有文件..." -ForegroundColor Yellow
git add .

# 提交更改
Write-Host "提交更改..." -ForegroundColor Yellow
git commit -m "feat: 重构API架构 - 将认证逻辑移到users-permissions插件 - 保持钱包API纯净 - 添加API测试脚本 - 修复路由和参数验证问题"

# 推送到远程仓库
Write-Host "推送到远程仓库..." -ForegroundColor Yellow
git push origin main

Write-Host "完成！" -ForegroundColor Green
Read-Host "按任意键继续..." 