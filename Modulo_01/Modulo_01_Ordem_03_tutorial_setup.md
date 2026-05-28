# Tutorial de Criação do Projeto - Módulo 1
**Sistema de Alocação de Recursos Didáticos**

Este tutorial detalha o passo a passo para inicializar a arquitetura do projeto (Front-end e Back-end) conforme o Documento de Especificação do Módulo 1. Utilizaremos **Django REST Framework (Python)** para a API, **PostgreSQL** para o banco de dados e **React (via Vite)** para a interface de usuário.

---

## 1. Pré-requisitos do Sistema
Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
* **Python** (versão 3.10 ou superior)
* **Node.js** (versão 18 ou superior) e **npm**
* **PostgreSQL** (versão 14 ou superior)
* **Git** (para versionamento)

---

## 2. Configuração do Banco de Dados (PostgreSQL)
Abra o seu terminal (ou a ferramenta gráfica pgAdmin) e crie o banco de dados que será utilizado pelo Back-end.

```sql
CREATE DATABASE modulo1_alocacao;
CREATE USER user_modulo1 WITH PASSWORD 'senha123';
ALTER ROLE user_modulo1 SET client_encoding TO 'utf8';
ALTER ROLE user_modulo1 SET default_transaction_isolation TO 'read committed';
ALTER ROLE user_modulo1 SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE modulo1_alocacao TO user_modulo1;
```

---

## 3. Configuração do Back-end (Django REST Framework)

### 3.1. Criando o Ambiente Virtual
Crie uma pasta raiz para o seu projeto e, dentro dela, inicialize o ambiente virtual Python para isolar as dependências.

```bash
mkdir projeto_modulo1
cd projeto_modulo1
python -m venv venv

# Ativando o ambiente virtual:
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
source venv/bin/activate
```

### 3.2. Instalando Dependências
Com o ambiente ativado, instale os pacotes necessários:

```bash
pip install django djangorestframework psycopg2-binary djangorestframework-simplejwt django-cors-headers reportlab
```

### 3.3. Inicializando o Projeto Django
Crie o projeto base e o aplicativo principal do Módulo 1.

```bash
django-admin startproject backend .
python manage.py startapp alocacao
```

### 3.4. Configurando o `settings.py`
No arquivo `backend/settings.py`, faça as seguintes alterações cruciais:

**A. Adicionar os Apps e Bibliotecas:**
```python
INSTALLED_APPS = [
    # ... apps padrão do django ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'alocacao', # Nosso app
]
```

**B. Configurar os Middlewares (Adicionar o CORS no topo):**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... resto dos middlewares ...
]

# Permitir que o Front-end (React) consuma a API
CORS_ALLOW_ALL_ORIGINS = True # Apenas para desenvolvimento local
```

**C. Configurar a Conexão com o Banco (PostgreSQL):**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'modulo1_alocacao',
        'USER': 'user_modulo1',
        'PASSWORD': 'senha123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**D. Configurar o DRF e o JWT:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

### 3.5. Rodando as Migrações Iniciais
Execute os comandos para criar as tabelas base no banco de dados e testar o servidor.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
O servidor deverá rodar em `http://127.0.0.1:8000/`.

---

## 4. Configuração do Front-end (React com Vite)

### 4.1. Criando o Projeto React
Abra um novo terminal (mantenha o servidor do Django rodando no outro), vá para a pasta raiz `projeto_modulo1` e crie o app React usando o Vite.

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### 4.2. Instalando Dependências do Front-end
Instale as bibliotecas padrão para roteamento, chamadas HTTP e manipulação de tokens.

```bash
npm install axios react-router-dom jwt-decode
```

### 4.3. Estruturando os Diretórios
Dentro da pasta `frontend/src/`, crie a seguinte estrutura recomendada para dividir responsabilidades:

```text
src/
 ┣ assets/          # Imagens e ícones
 ┣ components/      # Componentes reutilizáveis (Botões, Modais, Navbar)
 ┣ pages/           # Telas completas (Login, Dashboard, Reservas)
 ┣ services/        # Configuração do Axios e chamadas para a API (DRF)
 ┣ context/         # Contextos do React (ex: AuthContext para gerenciar o usuário logado)
 ┣ utils/           # Funções auxiliares (máscaras, formatações de data)
 ┣ App.jsx          # Configuração principal de Rotas
 ┗ main.jsx         # Ponto de entrada do React
```

### 4.4. Configurando o Axios (Conexão com a API)
Crie um arquivo `src/services/api.js` para centralizar as requisições para o Django:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Interceptor para injetar o token JWT automaticamente nas requisições
api.interceptors.request.use(async config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 4.5. Rodando o Servidor de Desenvolvimento
```bash
npm run dev
```
O Front-end estará disponível em `http://localhost:5173/`.

---

## 5. Próximos Passos (Divisão de Tarefas)

Agora que a arquitetura está montada e conectada, os alunos responsáveis pelos Requisitos Funcionais (RF-01 ao RF-12) podem começar o desenvolvimento em paralelo:

1. **Modelagem de Dados:** O primeiro passo é criar as classes (Models) no arquivo `alocacao/models.py` seguindo os dicionários de dados do documento de especificação.
2. **Serializers e Views:** Criar os serializers (`serializers.py`) e as views/viewsets (`views.py`) para montar os endpoints listados nos contratos JSON.
3. **Rotas da API:** Mapear as views no arquivo `urls.py`.
4. **Telas do React:** Criar as interfaces correspondentes em `frontend/src/pages/` consumindo as rotas via Axios.
