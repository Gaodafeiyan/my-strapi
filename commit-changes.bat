@echo off
echo 正在提交Git更改...

cd /d "%~dp0"

echo 添加所有文件...
git add .

echo 提交更改...
git commit -m "feat: 重构API架构 - 将认证逻辑移到users-permissions插件 - 保持钱包API纯净 - 添加API测试脚本 - 修复路由和参数验证问题"

echo 推送到远程仓库...
git push origin main

echo 完成！
pause 