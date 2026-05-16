@echo off
echo ==========================================
echo      CORRECAO AUTOMATICA DE AMBIENTE
echo ==========================================

echo 1. Encerrando processos Node.js travados (Corrige erro EBUSY)...
taskkill /F /IM node.exe /T 2>nul
if %errorlevel% equ 128 (
    echo Nenhum processo node.exe encontrado.
) else (
    echo Processos encerrados.
)

echo.
echo 2. Removendo instalacoes anteriores...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules removido.
)
if exist package-lock.json (
    del /f /q package-lock.json
    echo package-lock.json removido.
)

echo.
echo 3. Reinstalando dependencias (Isso pode demorar um pouco)...
call npm install

echo.
echo ==========================================
echo           CONCLUIDO!
echo ==========================================
echo Agora tente rodar: npm run dev
echo.
pause
