# Guia Passo a Passo: Configuração do Projeto na Faculdade

Siga este roteiro quando chegar ao computador do laboratório para configurar e rodar o projeto.

---

## 💾 PARTE 1: O que levar no Pendrive (Preparação em Casa)

Antes de sair de casa, garanta que a pasta do seu pendrive tenha a seguinte estrutura e arquivos:
*   A pasta **`projeto_modulo2`** (copiada sem as pastas `venv` e `node_modules`).
*   A pasta **`frontend/dist`** atualizada (após rodar `npm run build` na sua máquina de casa).
*   Os scripts automatizados na raiz: **`1_instalar_dependencias.bat`** e **`2_iniciar_projeto.bat`**.

---

## 🏫 PARTE 2: Configurando no PC da Faculdade (Passo a Passo)

### PASSO 1: Configurar o Banco de Dados (PostgreSQL)
Como o computador da faculdade já possui o PostgreSQL instalado:
1.  Abra a ferramenta de banco de dados deles (como **pgAdmin** ou **DBeaver**).
2.  Abra o **Query Tool** (editor de SQL) e execute os seguintes comandos para criar o usuário e o banco de dados que o projeto espera:
    ```sql
    CREATE DATABASE modulo2_tcc;
    CREATE USER user_modulo2 WITH PASSWORD 'senha123';
    ALTER ROLE user_modulo2 SET client_encoding TO 'utf8';
    ALTER ROLE user_modulo2 SET default_transaction_isolation TO 'read committed';
    ALTER ROLE user_modulo2 SET timezone TO 'America/Sao_Paulo';
    GRANT ALL PRIVILEGES ON DATABASE modulo2_tcc TO user_modulo2;
    ```
    *(Se você já criou o banco com outro nome ou usuário, lembre-se de abrir o arquivo `backend/settings.py` nas linhas 80-89 e ajustar o NAME, USER e PASSWORD).*

---

### PASSO 2: Instalar as Dependências (Python & Django)
1.  Insira o pendrive e copie a pasta `projeto_modulo2` para a máquina local (ex: no Desktop ou Documentos, para evitar lentidão do pendrive).
2.  Abra a pasta do projeto.
3.  Dê dois cliques no arquivo **`1_instalar_dependencias.bat`**.
    *   *O que ele vai fazer?* Ele vai ler o Python 3.10 da faculdade, criar um ambiente virtual (`venv`) limpo e instalar o Django 5.1 e todos os pacotes necessários configurados no `requirements.txt`.
    *   *Nota:* Aguarde a tela preta fechar ou mostrar a mensagem "Dependencias instaladas com sucesso!".

---

### PASSO 3: Rodar as Migrações e Iniciar os Servidores
1.  Na pasta do projeto, dê dois cliques no arquivo **`2_iniciar_projeto.bat`**.
    *   *O que ele vai fazer?*
        1. Executa o comando de migração do banco (`python manage.py migrate`) para estruturar as tabelas.
        2. Abre uma nova janela rodando o servidor Backend (Django) na porta `8000`.
        3. Abre outra janela rodando o servidor local do Python para servir a pasta `dist` do React na porta `5173`.
        4. Abre o seu navegador de internet automaticamente na página do sistema.
2.  Se o navegador não abrir sozinho após alguns segundos, abra o Google Chrome ou Firefox e acesse o endereço:
    ```text
    http://localhost:5173
    ```

Pronto! O sistema estará rodando perfeitamente integrado ao banco de dados PostgreSQL da faculdade.
