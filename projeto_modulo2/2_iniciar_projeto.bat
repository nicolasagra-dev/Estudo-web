@echo off
echo ===================================================
echo INICIALIZANDO PROJETO MODULO 2 (IFAM)
echo ===================================================
echo.
cd /d "%~dp0"

:: 1. Ativar o venv e rodar as migracoes
echo [1/3] Ativando ambiente virtual e aplicando migracoes no banco...
call venv\Scripts\activate.bat
python manage.py migrate

:: 2. Iniciar o Servidor do Django (Backend) em uma nova janela
echo.
echo [2/3] Iniciando o servidor Backend (Django) na porta 8000...
start "Backend - Django" cmd /k "call venv\Scripts\activate.bat && python manage.py runserver"

:: 3. Iniciar o Servidor do React (Frontend)
echo.
echo [3/3] Iniciando o servidor Frontend (React)...
if exist "frontend\dist" (
    echo Pasta 'dist' encontrada. Iniciando servidor web leve via Python na porta 5173...
    start "Frontend - React" cmd /k "cd frontend\dist && python -m http.server 5173"
) else (
    echo [AVISO] Pasta 'dist' nao encontrada!
    echo Certifique-se de compilar o front antes com 'npm run build' ou inicie via npm se tiver Node instalado.
)

echo.
echo Inicializacao concluida! 
echo O sistema estara pronto em http://localhost:5173/ em alguns segundos.
echo.
timeout /t 5
start http://localhost:5173/
