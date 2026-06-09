# Contexto do Projeto: Sistema de Gestão de TCC (Bancas de Defesa) - IFAM

Este arquivo reúne todo o contexto técnico, estrutural e visual do projeto para orientar e instruir a inteligência artificial (Gemini) durante a sua execução ou demonstração no computador da faculdade.

---

## 📋 1. Visão Geral do Sistema

*   **Instituição:** Instituto Federal do Amazonas (IFAM) - Campus Manaus Zona Leste.
*   **Finalidade:** Tela acadêmica para agendamento de bancas de defesa de TCC (Trabalhos de Conclusão de Curso). O aluno ou administrador visualiza as bancas cadastradas, cadastra novas bancas (definindo ID do Tema de TCC, data/hora de início, data/hora de fim e local ou link) e pode cancelar agendamentos.
*   **Restrições Acadêmicas:**
    *   O computador de destino (faculdade) roda Windows, com **Python 3.10.11** e **PostgreSQL**.
    *   **Sem privilégios de administrador** (bloqueio do PowerShell para executar scripts `.ps1`).
    *   **Sem Node.js/npm** instalados na máquina do laboratório.
    *   **Sem internet de alta velocidade** ou restrições de rede (necessidade de dependências já baixadas ou fáceis de configurar localmente).

---

## ⚙️ 2. Arquitetura Técnica & Stack

O projeto está dividido em duas partes principais (Backend e Frontend):

### A. Backend (Django REST Framework)
*   **Tecnologia:** Python + Django >= 5.0.0, < 5.2.0 (compatível com Python 3.10.11 do PC de destino).
*   **Diretório:** `/backend`
*   **Ponto de Entrada:** `manage.py`
*   **Endpoints Principais:**
    *   `GET /api/agendamentos/` - Lista todas as bancas ordenadas por data.
    *   `POST /api/agendamentos/` - Cadastra uma nova banca.
    *   `DELETE /api/agendamentos/<id>/` - Cancela uma banca agendada.
*   **CORS:** Configurado para aceitar requisições de qualquer origem (`CORS_ALLOW_ALL_ORIGINS = True`), o que permite que o frontend servido em qualquer porta se comunique com o backend.

### B. Frontend (React + Vite)
*   **Tecnologia:** React (com build em arquivos estáticos otimizados na pasta `frontend/dist`).
*   **Diretório:** `/frontend`
*   **Comunicação com a API:** Feita diretamente pelo arquivo `/frontend/src/services/api.js` apontando para o endereço absoluto do backend: `http://127.0.0.1:8000/api/`.
*   **Como é servido:** Como não há Node.js instalado, a pasta `/frontend/dist` é servida como um servidor web de arquivos estáticos simples usando o módulo nativo do Python:
    ```bash
    python -m http.server 5173
    ```
    Isso disponibiliza o frontend em `http://localhost:5173`.

---

## 🎨 3. Padrão de Design Visual (Identidade Visual IFAM)

A interface do agendamento foi personalizada para seguir o **Manual de Aplicação da Marca dos Institutos Federais** (Edição 2015), adotando a **Assinatura Vertical de Campus**:

1.  **Símbolo Centralizado (Grid Oficial):**
    *   O símbolo (o logotipo estilizado representando o "i" e o "F") fica centralizado horizontalmente no topo da página.
    *   Consiste em uma grade com:
        *   Círculo vermelho (representando o ponto do "i") com diâmetro 10% maior que os quadrados.
        *   Quadrados verdes com cantos ligeiramente arredondados (`rx="2"`).
        *   Proporções oficiais baseadas na malha de construção do manual.
2.  **Assinatura de Texto (Vertical):**
    *   Sob o símbolo, o texto institucional está empilhado e centralizado horizontalmente:
        *   `INSTITUTO` (negrito, letras maiúsculas, preto).
        *   `FEDERAL` (negrito, letras maiúsculas, preto).
        *   `Amazonas` (peso médio, preto).
        *   *(Linha divisória horizontal na cor verde oficial do IF)*.
        *   `Campus` (regular, preto).
        *   `Manaus Zona Leste` (negrito, preto).
3.  **Paleta de Cores e Estilos:**
    *   `--cor-verde-marca`: `#2f9e41` (Verde oficial do IF).
    *   `--cor-vermelho-marca`: `#cd191e` (Vermelho oficial do IF).
    *   `--verde-principal`: `#135846` (Verde escuro institucional para elementos de destaque e botões primários).
    *   Botões de ação direta (ex: Cancelar) usam tons de vermelho de feedback.
    *   Retirado qualquer indicador de requisitos antigos como "RF-19" da interface principal para focar no design acadêmico real.

---

## 🚀 4. Scripts de Execução Automatizada (CMD)

Para rodar o projeto de forma rápida e contornar os bloqueios de permissão do PowerShell, a raiz do projeto contém dois arquivos em lote (`.bat`) nativos do CMD:

1.  **`1_instalar_dependencias.bat`**:
    *   Verifica se o Python está no PATH.
    *   Cria um ambiente virtual local (`python -m venv venv`).
    *   Ativa o ambiente virtual e instala as dependências Python a partir do arquivo `requirements.txt`.
2.  **`2_iniciar_projeto.bat`**:
    *   Ativa o ambiente virtual e roda as migrações no banco de dados (`python manage.py migrate`).
    *   Abre uma nova janela de comando rodando o servidor Django na porta `8000`.
    *   Abre outra janela de comando rodando o servidor Python HTTP para servir o frontend React na porta `5173` a partir de `frontend/dist`.
    *   Abre automaticamente a URL `http://localhost:5173` no navegador padrão.

---

## 💾 5. Configuração do Banco de Dados & Fallbacks

### PostgreSQL (Padrão)
O projeto está configurado para conectar ao banco PostgreSQL na porta `5432` com as credenciais:
*   **Banco:** `modulo2_tcc`
*   **Usuário:** `user_modulo2`
*   **Senha:** `senha123`

Script SQL de inicialização a ser rodado no pgAdmin/DBeaver na faculdade:
```sql
CREATE DATABASE modulo2_tcc;
CREATE USER user_modulo2 WITH PASSWORD 'senha123';
ALTER ROLE user_modulo2 SET client_encoding TO 'utf8';
ALTER ROLE user_modulo2 SET default_transaction_isolation TO 'read committed';
ALTER ROLE user_modulo2 SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE modulo2_tcc TO user_modulo2;
```

### Fallback SQLite (Se o Postgres falhar)
Caso não seja possível usar o PostgreSQL ou haja algum problema de conexão no computador do laboratório, a configuração pode ser alterada instantaneamente em `/backend/settings.py` (comentando a configuração do PostgreSQL nas linhas 80-89 e descomentando o SQLite):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```
*Após salvar o arquivo, basta rodar o `2_iniciar_projeto.bat` novamente para que o Django crie o arquivo `db.sqlite3` automaticamente na raiz e o sistema funcione sem precisar de qualquer servidor de banco instalado.*
