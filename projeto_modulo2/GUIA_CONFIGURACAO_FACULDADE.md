# Guia Passo a Passo: Configuração do Projeto na Faculdade (Sem Pendrive)

Siga este roteiro quando chegar ao computador do laboratório da faculdade para baixar, configurar e rodar o projeto.

---

## ☁️ PARTE 1: Enviando e Baixando o Projeto (Sem Pendrive)

Como você não usará pendrive, faça o seguinte:
1. **Envie o arquivo `projeto_modulo2.zip`** (que foi gerado na raiz da sua pasta) para si mesmo por um dos seguintes canais:
   * Envie por e-mail (como anexo).
   * Salve no seu **Google Drive**, **OneDrive** ou **Dropbox**.
   * Envie para o seu próprio número/grupo no **WhatsApp Web** ou **Discord**.
2. **No computador da faculdade:**
   * Abra o navegador, acesse seu e-mail/Drive/WhatsApp e **baixe** o arquivo `projeto_modulo2.zip`.
   * **Extraia** o arquivo ZIP em uma pasta fácil de acessar, como a **Área de Trabalho (Desktop)** ou **Documentos**.
   * *Atenção:* Não execute os arquivos de dentro do ZIP sem extrair primeiro! Sempre extraia a pasta completa.

---

## 🏫 PARTE 2: Configurando no PC da Faculdade (Passo a Passo)

### PASSO 1: Configurar o Banco de Dados (PostgreSQL)
Como o computador da faculdade já possui o PostgreSQL instalado:
1. Abra a ferramenta de banco de dados deles (como **pgAdmin** ou **DBeaver**).
2. Abra o **Query Tool** (editor de SQL) e execute os seguintes comandos para criar o usuário e o banco de dados que o projeto espera:
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
1. Abra a pasta `projeto_modulo2` extraída no computador local.
2. Dê dois cliques no arquivo **`1_instalar_dependencias.bat`**.
   * *O que ele vai fazer?* Ele vai ler o Python instalado na máquina da faculdade, criar um ambiente virtual (`venv`) limpo e instalar o Django 5.1 e os pacotes necessários configurados em `requirements.txt`.
   * *Atenção:* O script usa o **CMD tradicional** (Prompt de Comando) para evitar o bloqueio de permissão do PowerShell comum nas máquinas acadêmicas.
   * Aguarde a janela preta mostrar a mensagem *"Dependencias instaladas com sucesso!"* e pressione qualquer tecla para fechar.

---

### PASSO 3: Rodar as Migrações e Iniciar o Sistema
1. Na pasta do projeto, dê dois cliques no arquivo **`2_iniciar_projeto.bat`**.
   * *O que ele vai fazer?*
     1. Executa o comando de migração do banco (`python manage.py migrate`) para criar as tabelas necessárias.
     2. Abre uma nova janela CMD rodando o servidor Backend (Django) na porta `8000`.
     3. Abre outra janela CMD rodando o servidor local do Python para servir a pasta `dist` do React na porta `5173`.
     4. Abre o seu navegador de internet automaticamente no endereço do sistema.
2. Se o navegador não abrir sozinho após alguns segundos, abra o Google Chrome ou Firefox e acesse o endereço:
   ```text
   http://localhost:5173
   ```

Pronto! O sistema estará rodando perfeitamente integrado ao banco de dados PostgreSQL da faculdade, com o logotipo vertical oficial do IFAM.
