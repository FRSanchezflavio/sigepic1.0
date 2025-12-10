@echo off
TITLE Sistema SIGEPIC Launcher

:: 0. Limpieza de procesos anteriores
echo Cerrando instancias previas de Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: 1. Iniciar Backend
echo Iniciando Servidor Backend...
cd backend
:: Usamos "start" para abrir en nueva ventana y no bloquear el script
start "SIGEPIC Backend" cmd /k "npm start"
cd ..

:: 2. Iniciar Frontend
echo Iniciando Cliente Frontend...
cd frontend
:: Usamos "start" para abrir en nueva ventana
start "SIGEPIC Frontend" cmd /k "npm run dev"
cd ..

:: 3. Abrir Navegador
echo Abriendo la aplicacion en el navegador...
:: Espera 5 segundos para asegurar que Vite haya iniciado
:: Si tu PC es lenta, aumenta este valor
timeout /t 5
start http://localhost:5173

echo Sistema iniciado correctamente.
echo NOTA: Si cierra las ventanas negras, se detendra el sistema.
timeout /t 3
exit
