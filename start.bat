@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  LearnVillage 本機預覽啟動中...
echo  瀏覽器會自動開啟 http://localhost:8000
echo  要結束請關閉這個視窗（或按 Ctrl+C）
echo.
start "" http://localhost:8000
where py >nul 2>nul && (py -m http.server 8000 & goto :eof)
where python >nul 2>nul && (python -m http.server 8000 & goto :eof)
echo  找不到 Python。請改用 VS Code 的 Live Server 外掛開啟 index.html，
echo  或先安裝 Python：https://www.python.org/downloads/
pause
