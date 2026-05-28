# Tutorial de Criação do Projeto - Módulo 2
**Sistema de Gestão de TCC e Bancas**

Este tutorial detalha o passo a passo para inicializar a arquitetura do projeto (Front-end e Back-end) em sua máquina, focando especificamente no escopo do Módulo 2. A stack base escolhida para a disciplina é composta por **Django REST Framework** para a API, **PostgreSQL** para o banco de dados e **React (via Vite)** para a interface.

---

## 1. Pré-requisitos do Sistema
Certifique-se de ter as seguintes ferramentas devidamente instaladas:
* **Python** (versão 3.10 ou superior)
* **Node.js** (versão 18 ou superior) e **npm**
* **PostgreSQL** (versão 14 ou superior)
* **Git** (para controle de versão em equipe)

---

## 2. Configuração do Banco de Dados (PostgreSQL)
Abra seu terminal (psql) ou ferramenta gráfica (como pgAdmin ou DBeaver) e crie o banco e o usuário exclusivos para o Módulo 2.

```sql
CREATE DATABASE modulo2_tcc;
CREATE USER user_modulo2 WITH PASSWORD 'senha123';
ALTER ROLE user_modulo2 SET client_encoding TO 'utf8';
ALTER ROLE user_modulo2 SET default_transaction_isolation TO 'read committed';
ALTER ROLE user_modulo2 SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE modulo2_tcc TO user_modulo2;
```

---

## 3. Configuração do Back-end (Django REST Framework)

### 3.1. Criando o Ambiente Virtual e a Pasta do Projeto
Crie uma pasta raiz e inicialize o ambiente virtual para as dependências do Python.

```bash
mkdir projeto_modulo2
cd projeto_modulo2
python -m venv venv

# Ativando o ambiente virtual no Windows:
venv\Scripts\activate
# Ativando no Linux/Mac:
source venv/bin/activate
```

### 3.2. Instalando as Dependências Essenciais
Com o `venv` ativo, instale o Django, o DRF, o conector do Postgres, o JWT e ferramentas extras para CORS e PDF.

```bash
pip install django djangorestframework psycopg2-binary djangorestframework-simplejwt django-cors-headers reportlab
```

### 3.3. Inicializando o Projeto e o App
Crie o ecossistema do Django e o app centralizador do módulo de TCC.

```bash
django-admin startproject backend .
python manage.py startapp gestao_tcc
```

### 3.4. Parametrizando o `settings.py`
Abra o arquivo `backend/settings.py` e aplique as seguintes configurações vitais:

**A. Registro dos Apps:**
```python
INSTALLED_APPS = [
    # ... apps nativos do django ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'gestao_tcc', # App criado para o Módulo 2
]
```

**B. Liberação de CORS (Adicionar no topo da lista de Middlewares):**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... restante dos middlewares originais ...
]

# Liberação temporária para o Front-end local
CORS_ALLOW_ALL_ORIGINS = True 
```

**C. Link com o PostgreSQL:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'modulo2_tcc',
        'USER': 'user_modulo2',
        'PASSWORD': 'senha123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**D. Autenticação via JWT no DRF:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

### 3.5. Primeiras Migrações e Teste do Servidor
Aplique as migrações iniciais (usuários e permissões padrão do Django) e rode o servidor.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
A API estará escutando na porta padrão: `http://127.0.0.1:8000/`.

---

## 4. Configuração do Front-end (React com Vite)

### 4.1. Scaffolding do Projeto React
Abra uma nova aba/janela no terminal (não feche o servidor do Django). Navegue até a pasta `projeto_modulo2` e inicie o Vite.

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### 4.2. Instalando o Arsenal do Front-end
Para consumir a API de forma eficiente e estruturar as rotas:

```bash
npm install axios react-router-dom jwt-decode
```

### 4.3. Arquitetura de Pastas Recomendada
Dentro de `frontend/src/`, crie esta organização básica para facilitar a vida da equipe de 13 alunos:

```text
src/
 ┣ assets/          # Logo, imagens, CSS globais
 ┣ components/      # Botões, inputs, modais, cabeçalhos, barras laterais
 ┣ pages/           # Telas completas (Ex: PainelAluno, DashboardCoordenação, BancaAvaliacao)
 ┣ services/        # Config do Axios e endpoints (auth.service.js, tcc.service.js)
 ┣ context/         # AuthContext.js para guardar os dados de login no estado global
 ┣ utils/           # Formatadores de data, cálculos
 ┣ App.jsx          # Declarador central de Rotas do react-router-dom
 ┗ main.jsx         # Ponto de inicialização do React
```

### 4.4. Configurando a Ponte com a API (Axios)
Crie o arquivo base de comunicação `src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Interceptor injeta o Bearer token em todas as requisições seguras
api.interceptors.request.use(async config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 4.5. Ligando os Motores do Front-end
```bash
npm run dev
```
Seu Front-end vai brilhar em `http://localhost:5173/`.

---

## 5. Próximos Passos (Divisão para o Time)

O ecossistema básico do Módulo 2 está de pé. A equipe responsável pelos **RF-13 ao RF-25** deve agora seguir este fluxo de trabalho:

1. **Modelagem:** Criar as tabelas em `gestao_tcc/models.py` (TemaTcc, CronogramaFase, MembroBanca, etc.) conforme os dicionários de dados.
2. **APIs e Serialização:** Construir `serializers.py` e `views.py` para cada contrato JSON definido nos requisitos.
3. **Mapeamento:** Exportar tudo no `urls.py`.
4. **Interface:** Dividir as pastas em `pages/` e integrar com os endpoints criados utilizando componentes funcionais do React.
