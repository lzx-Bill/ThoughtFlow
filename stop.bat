@echo off
chcp 65001 >nul
cls

echo ================================
echo   停止 ThoughtFlow 服务
echo ================================
echo.

echo 正在停止后端服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :13089') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo 正在停止前端服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3089') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo 服务已停止！
echo.
pause
