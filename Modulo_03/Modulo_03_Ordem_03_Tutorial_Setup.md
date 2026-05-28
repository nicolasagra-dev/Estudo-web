# Tutorial de Criação do Projeto - Módulo 3
**Sistema de Gestão de Atividades Complementares**

Este tutorial apresenta o roteiro prático para a configuração e inicialização da arquitetura do projeto (Front-end e Back-end) para o Módulo 3. A tecnologia base é composta por **Django REST Framework (DRF)** para a construção da API, **PostgreSQL** para o banco de dados e **React (via Vite)** para a interface de usuário.

---

## 1. Pré-requisitos do Sistema
Antes de iniciar, garanta que seu ambiente de desenvolvimento possua as seguintes ferramentas:
* **Python** (versão 3.10 ou superior)
* **Node.js** (versão 18 ou superior) e **npm**
* **PostgreSQL** (versão 14 ou superior)
* **Git** (para versionamento de código)

---

## 2. Configuração do Banco de Dados (PostgreSQL)
No seu terminal psql ou cliente gráfico (pgAdmin/DBeaver), crie o banco de dados isolado e o usuário para o Módulo 3.

```sql
CREATE DATABASE modulo3_atividades;
CREATE USER user_modulo3 WITH PASSWORD 'senha123';
ALTER ROLE user_modulo3 SET client_encoding TO 'utf8';
ALTER ROLE user_modulo3 SET default_transaction_isolation TO 'read committed';
ALTER ROLE user_modulo3 SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE modulo3_atividades TO user_modulo3;
```

---

## 3. Configuração do Back-end (Django REST Framework)

### 3.1. Criação do Ambiente Virtual
Crie a pasta principal do projeto e inicialize o ambiente virtual Python.

```bash
mkdir projeto_modulo3
cd projeto_modulo3
python -m venv venv

# Ativação no Windows:
venv\Scripts\activate
# Ativação no Linux/Mac:
source venv/bin/activate
```

### 3.2. Instalação de Dependências
Com o ambiente ativado, instale os pacotes base para o Django, manipulação de API, banco de dados, CORS e geração de PDF.

```bash
pip install django djangorestframework psycopg2-binary djangorestframework-simplejwt django-cors-headers reportlab
```

### 3.3. Inicialização do Projeto e App
Crie a estrutura do projeto Django e o aplicativo focado nas atividades complementares.

```bash
django-admin startproject backend .
python manage.py startapp atividades
```

### 3.4. Configuração do `settings.py`
Edite o arquivo `backend/settings.py` com as configurações necessárias:

**A. Aplicativos Instalados:**
```python
INSTALLED_APPS = [
    # ... apps padrão ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'atividades', # Nosso aplicativo principal
]
```

**B. Middleware e CORS:**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Adicionar no topo
    # ... middlewares padrão ...
]

# Permitir consumo local pelo Front-end
CORS_ALLOW_ALL_ORIGINS = True 
```

**C. Conexão com o PostgreSQL:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'modulo3_atividades',
        'USER': 'user_modulo3',
        'PASSWORD': 'senha123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**D. Configuração de Autenticação DRF:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

### 3.5. Migrações e Execução
Crie as tabelas nativas do Django e inicie o servidor.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
A API rodará localmente em `http://127.0.0.1:8000/`.

---

## 4. Configuração do Front-end (React com Vite)

### 4.1. Criação do Projeto React
Mantenha o Back-end rodando, abra uma nova aba do terminal na raiz `projeto_modulo3` e execute a criação via Vite.

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### 4.2. Instalação de Bibliotecas Front-end
Para as rotas, requisições HTTP e controle de JWT, instale:

```bash
npm install axios react-router-dom jwt-decode
```

### 4.3. Organização de Diretórios
Prepare a estrutura dentro de `frontend/src/` para manter a organização entre a equipe:

```text
src/
 ┣ assets/          # Arquivos estáticos (CSS, logos, ícones)
 ┣ components/      # Componentes visuais isolados (Input, Modal, CardCertificado)
 ┣ pages/           # Views das rotas (Login, ExtratoHoras, FilaCoordenador)
 ┣ services/        # Configuração do Axios e chamadas de API
 ┣ context/         # AuthContext para estado de sessão
 ┣ utils/           # Helpers (formatação de horas, máscaras de CPF)
 ┣ App.jsx          # Configuração do React Router
 ┗ main.jsx         # Ponto de injeção da aplicação
```

### 4.4. Instância do Axios (Ponte com a API)
Configure o Axios em `src/services/api.js` para auto-injetar os tokens JWT:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use(async config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 4.5. Inicialização do Servidor React
```bash
npm run dev
```
O Front-end estará acessível em `http://localhost:5173/`.

---

## 5. Próximos Passos (RF-26 ao RF-38)

Com a arquitetura conectada, os alunos devem focar em implementar os Requisitos Funcionais do Módulo 3:

1. **Modelos:** Criar as entidades no arquivo `atividades/models.py` (`Aluno`, `Certificado`, `CategoriaAtividade`, `EventoInterno`, etc.).
2. **APIs e DRF:** Escrever as validações no `serializers.py` e a lógica de endpoints nas `views.py`.
3. **Roteamento Back-end:** Ligar os endpoints no `urls.py`.
4. **Construção Front-end:** Criar as telas no React que consumirão os endpoints documentados nos contratos JSON.
