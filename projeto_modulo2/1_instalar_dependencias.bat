@echo off
echo ===================================================
echo INSTALACAO DE DEPENDENCIAS - PROJETO MODULO 2 (IFAM)
echo ===================================================
echo.
cd /d "%~dp0"

:: 1. Verificar se o Python esta instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado no PATH!
    echo Por favor, instale o Python ou marque a opcao 'Add Python to PATH' no instalador.
    pause
    exit /b
)

:: 2. Criar o ambiente virtual se nao existir
if not exist "venv" (
    echo Criando ambiente virtual (venv)...
    python -m venv venv
)

:: 3. Ativar o venv e instalar dependencias do Django
echo.
echo Instalando dependencias do Django (requirements.txt)...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Dependencias instaladas com sucesso!
pause
