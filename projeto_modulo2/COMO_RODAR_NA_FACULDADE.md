# Guia: Como Rodar o Projeto nos Computadores da Faculdade (Sem Pendrive)

Apresentar projetos de desenvolvimento em computadores de laboratório da faculdade é um desafio comum, pois essas máquinas costumam ter restrições de internet, bloqueio de administrador (sem privilégios para executar scripts do PowerShell ou instalar Node.js) ou apagam tudo ao reiniciar.

Aqui está o passo a passo estratégico e os "macetes" para garantir que o projeto rode em qualquer computador da faculdade de forma simples e rápida.

---

## 🚀 O Grande Segredo: Simplifique a Stack

Na faculdade, você **não precisa rodar o Node.js nem ter permissão de administrador** se usar as seguintes técnicas implementadas no projeto:
1. **Use a pasta `dist` (Build) do React:** Nós já compilamos o Front-end para você. Os arquivos finais otimizados estão na pasta `frontend/dist`. Você não precisará rodar `npm run dev` nem instalar o Node/npm na faculdade. O frontend é servido como arquivos estáticos super leves.
2. **Uso do CMD em vez de PowerShell:** Computadores de faculdade costumam bloquear a execução de scripts do PowerShell (`.ps1`). Por isso, criamos arquivos `.bat` nativos do CMD (Prompt de Comando) que rodam sem qualquer problema de permissão.
3. **Use o SQLite como Fallback:** Se o computador da faculdade estiver sem PostgreSQL e você não puder instalar, você pode mudar uma configuração rápida no Django para usar o **SQLite** (um banco de dados local que roda num arquivo de texto simples, sem precisar de nenhum serviço ativo).

---

## ☁️ Passo 1: Preparação e Download (Sem Pendrive)

Como você não utilizará pendrive, faça o seguinte:
1. **Envie o arquivo `projeto_modulo2.zip`** (que criamos na raiz) para si mesmo via E-mail, Google Drive ou WhatsApp Web.
2. Ao chegar no PC da faculdade, **baixe o arquivo ZIP** e extraia tudo para uma pasta local (ex: Área de Trabalho ou Documentos).
3. Certifique-se de que a máquina possui o **Python** instalado (abra o CMD e digite `python --version`).
   * *Nota:* Se não estiver instalado, você pode baixá-lo no site oficial do Python. Ao instalar, marque sempre a caixa **"Add Python to PATH"**.

---

## 🏫 Passo 2: Configurando no PC da Faculdade

### 1. Recriar o Ambiente Virtual (venv)
Como as pastas do ambiente virtual (`venv`) contêm caminhos absolutos do computador original, você deve recriá-lo na máquina da faculdade:
* Abra a pasta do projeto e clique duas vezes em **`1_instalar_dependencias.bat`**.
* O script criará uma pasta `venv` local limpa e instalará todas as dependências do Django contidas no `requirements.txt`.

### 2. Configurar o Banco de Dados (PostgreSQL)
Se o laboratório da faculdade tiver o PostgreSQL instalado (como pgAdmin ou DBeaver):
1. Abra a ferramenta e execute os comandos SQL para criar a base de dados do projeto:
   ```sql
   CREATE DATABASE modulo2_tcc;
   CREATE USER user_modulo2 WITH PASSWORD 'senha123';
   GRANT ALL PRIVILEGES ON DATABASE modulo2_tcc TO user_modulo2;
   ```
2. Clique duas vezes em **`2_iniciar_projeto.bat`** na pasta do projeto. Ele executará as migrações automáticas (`python manage.py migrate`) e abrirá os servidores do front-end e do back-end.

---

## 🛠️ Plano B: Sem PostgreSQL / Sem acesso de Administrador

Se o PostgreSQL não estiver funcionando ou o computador não possuir o banco de dados instalado:
1. Abra o arquivo **`backend/settings.py`** na pasta extraída.
2. Procure pela variável `DATABASES` (linhas 80-89) e comente a configuração do PostgreSQL colocando um caractere `#` na frente de cada linha.
3. Descomente ou configure o banco de dados **SQLite** adicionando o seguinte código:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.sqlite3',
           'NAME': BASE_DIR / 'db.sqlite3',
       }
   }
   ```
4. Salve o arquivo. Clique duas vezes em **`2_iniciar_projeto.bat`**.
   * *O Django criará automaticamente o arquivo `db.sqlite3` na raiz e rodará o sistema sem necessitar de nenhum serviço de banco de dados instalado!*

---

## 🖥️ Passo 3: Rodando e Apresentando

O script **`2_iniciar_projeto.bat`** faz tudo por você:
* Inicia o backend Django na porta `8000`.
* Inicia um servidor Python leve servindo a pasta `frontend/dist` na porta `5173`.
* Abre o navegador na URL `http://localhost:5173`.

Acesse e apresente seu trabalho com sucesso!
