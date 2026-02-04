@echo off
chcp 65001 >nul
cls

echo ================================
echo   ThoughtFlow 启动脚本
echo ================================
echo.

REM 获取脚本所在目录
cd /d "%~dp0"

echo [1/3] 检查环境...
echo.

REM 检查 Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo [2/3] 启动后端服务 (端口: 13089)...
echo.

REM 启动后端
cd backend
if not exist "venv\" (
    echo 首次运行，正在创建虚拟环境...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo 正在安装后端依赖...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

start "ThoughtFlow Backend" cmd /k "cd /d %cd% && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 13089 --reload"
cd ..

echo 后端服务已启动！
echo.
echo [3/3] 启动前端服务 (端口: 3089)...
echo.

REM 启动前端
cd frontend
if not exist "node_modules\" (
    echo 首次运行，正在安装前端依赖...
    call npm install
)

start "ThoughtFlow Frontend" cmd /k "cd /d %cd% && npm run dev"
cd ..

echo.
echo ================================
echo   启动完成！
echo ================================
echo.
echo 后端地址: http://localhost:13089
echo API 文档: http://localhost:13089/docs
echo 前端地址: http://localhost:3089
echo.
echo 按任意键关闭此窗口 (注意: 不会关闭后端和前端服务)
pause >nul
