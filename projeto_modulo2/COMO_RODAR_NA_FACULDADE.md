# Guia: Como Rodar o Projeto nos Computadores da Faculdade

Apresentar projetos de desenvolvimento em computadores de laboratório da faculdade é um desafio comum, pois essas máquinas costumam ter restrições de internet, bloqueio de administrador (sem privilégios para instalar PostgreSQL ou Node.js) ou apagam tudo ao reiniciar.

Aqui está o passo a passo estratégico e os "macetes" para garantir que o projeto rode em qualquer computador da faculdade.

---

## 🚀 O Grande Segredo: Simplifique a Stack
Na faculdade, você **não precisa rodar o Node.js nem instalar o PostgreSQL** se usar as seguintes técnicas:
1.  **Use a pasta `dist` (Build) do React:** Nós já compilamos o Front-end. Os arquivos finais estão prontos na pasta `dist`. Você não precisará rodar `npm run dev` nem instalar o Node/npm na faculdade.
2.  **Use o SQLite temporariamente:** Se o computador da faculdade não tiver o PostgreSQL instalado e você não puder instalar (sem senha de Admin), altere uma configuração no Django para usar o **SQLite** (um banco de dados local que roda num arquivo simples, sem precisar de nenhum serviço ativo).

---

## 💾 Passo 1: Preparação no seu Pendrive (Em Casa)

Antes de ir para a faculdade, copie a pasta inteira do projeto para o pendrive:
1.  Abra a pasta do front-end (`frontend`) no seu PC e execute no terminal:
    ```bash
    npm run build
    ```
    Isso garantirá que a pasta `frontend/dist` está com a versão mais recente do sistema.
2.  Copie toda a pasta `projeto_modulo2` para o seu pendrive.
3.  *Dica:* Baixe o instalador do Python para Windows (versão 3.10 ou superior, instalador offline `.exe`) e coloque no pendrive, caso a máquina da faculdade não tenha Python instalado.

---

## 🏫 Passo 2: Configurando no PC da Faculdade

Ao abrir a pasta no PC da faculdade, siga estes passos:

### 1. Instalar/Verificar o Python
*   Abra o Prompt de Comando (CMD) e digite `python --version`.
*   Se não estiver instalado, execute o instalador do Python que você colocou no pendrive.
*   **⚠️ IMPORTANTE:** Na primeira tela do instalador, marque a caixa **"Add Python to PATH"** (Adicionar Python ao PATH) antes de clicar em instalar. Se não marcar isso, os comandos do Python não funcionarão no terminal.

### 2. Recriar o Ambiente Virtual (venv)
Como as pastas do ambiente virtual (`venv`) contêm caminhos absolutos do seu computador pessoal, você deve recriá-lo na máquina da faculdade:
1.  Abra o CMD dentro da pasta do projeto (`projeto_modulo2`).
2.  Apague a pasta `venv` antiga (se existir).
3.  Crie uma nova e instale as dependências:
    ```bash
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```

---

## 🛠️ Passo 3: Lidando com o Banco de Dados (Plano A ou B)

### 📌 Plano A: O PC da faculdade já tem PostgreSQL
Se o PostgreSQL estiver disponível no laboratório:
1.  Abra o cliente (pgAdmin, DBeaver ou o terminal psql).
2.  Execute os comandos SQL de criação:
    ```sql
    CREATE DATABASE modulo2_tcc;
    CREATE USER user_modulo2 WITH PASSWORD 'senha123';
    GRANT ALL PRIVILEGES ON DATABASE modulo2_tcc TO user_modulo2;
    ```
3.  No terminal do projeto (com a `venv` ativa), execute as migrações:
    ```bash
    python manage.py migrate
    ```

### 📌 Plano B: Sem PostgreSQL / Sem acesso de Administrador (Salvamento de Apresentação)
Se não for possível usar o PostgreSQL, altere temporariamente o banco para **SQLite** no Django:
1.  Abra o arquivo **`backend/settings.py`**.
2.  Procure pela variável `DATABASES` e substitua a configuração do PostgreSQL por esta (comente a do Postgres colocando `#` na frente das linhas):
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
    ```
3.  Salve o arquivo. No terminal (com a `venv` ativa), crie o banco instantaneamente rodando:
    ```bash
    python manage.py migrate
    ```
    *(O Django criará automaticamente um arquivo chamado `db.sqlite3` na pasta do projeto e estruturará todas as tabelas lá de forma transparente. Sem instalar nada!)*

---

## 🖥️ Passo 4: Iniciando os Servidores na Faculdade

Agora, com o banco pronto (seja Postgres ou SQLite) e a `venv` ativa:

### 1. Iniciar o Back-end (Django)
No terminal do projeto:
```bash
python manage.py runserver
```
*(O Django ficará rodando no endereço `http://127.0.0.1:8000/`)*.

### 2. Iniciar o Front-end (React) sem precisar de Node.js
Como você tem a pasta `dist` pronta, você pode usar o próprio Python para rodar o servidor de arquivos do React:
1.  Abra um **novo** terminal (CMD) e entre na pasta `projeto_modulo2/frontend/dist`:
    ```bash
    cd frontend/dist
    ```
2.  Rode o servidor web embutido do Python na porta do front-end (`5173`):
    ```bash
    python -m http.server 5173
    ```
3.  Pronto! Abra o navegador e acesse:
    ```text
    http://localhost:5173
    ```
O sistema abrirá a tela estilizada do IFAM e se comunicará com o Django (porta 8000) perfeitamente!
