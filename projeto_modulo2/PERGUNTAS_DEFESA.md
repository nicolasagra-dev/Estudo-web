# Guia de Preparação para Defesa Acadêmica (FAQ do Professor)

Este documento foi criado para ajudar a equipe a se preparar para a apresentação e defesa do projeto frente ao professor da disciplina. Abaixo estão as perguntas técnicas e arquiteturais mais comuns que os avaliadores costumam fazer, junto com as respostas esperadas.

---

## 1. Perguntas sobre Arquitetura e Fluxo de Dados

### ❓ "Explique o fluxo completo de dados quando o usuário clica em 'Agendar banca'."
**Resposta Esperada:**
1.  **Ação no Componente:** O usuário preenche o formulário e clica no botão. O React captura o evento de submit e chama a função `handleSubmit` no arquivo `AgendamentoBancaPage.jsx`.
2.  **Preparação e Envio (Front):** A função trata as datas (converte para ISO string), adiciona validações básicas e chama a função `criarAgendamento()` de `services/agendamentoBanca.service.js`. O **Axios** monta a requisição HTTP `POST`, anexa o token JWT no cabeçalho (*Header Authorization*) e envia os dados JSON para a URL da API.
3.  **Roteamento (Back):** O servidor Django recebe a requisição. O arquivo `urls.py` direciona a requisição para a View correspondente em `gestao_tcc/views.py`.
4.  **Validação e Persistência:** A View aciona o **Serializer**, que faz a validação dos dados recebidos (se as datas são válidas, se o tema existe, etc.). Se tudo estiver correto, o Django ORM traduz os dados para um comando SQL `INSERT` e os envia ao **PostgreSQL**.
5.  **Confirmação:** O Postgres confirma o salvamento, o Django serializa os dados salvos e responde com o status HTTP `201 Created`.
6.  **Atualização da UI:** O Axios recebe a resposta de sucesso. O React altera os estados locais (`success`, `form`, etc.), limpando o formulário, exibindo o aviso de sucesso e disparando a função `carregarAgendamentos()` para atualizar a lista na tabela.

### ❓ "Por que separar o Front-end (React) do Back-end (Django)? Quais as vantagens?"
**Resposta Esperada:**
*   **Separação de Conceitos (Separation of Concerns):** O front-end cuida exclusivamente da experiência do usuário (UI/UX) e o back-end foca nas regras de negócio, segurança e persistência de dados.
*   **Multiplataforma:** A mesma API em Django pode ser usada no futuro para alimentar um aplicativo móvel (Android/iOS) ou integrar com outros sistemas do IFAM, sem precisar reescrever o código do servidor.
*   **Desenvolvimento Paralelo:** Equipes de front-end e back-end podem trabalhar de forma independente ao mesmo tempo, desde que combinem os contratos da API previamente (URLs e formatos de JSON).

---

## 2. Perguntas sobre Front-end (React & Vite)

### ❓ "Para que serve o hook `useMemo` na ordenação dos agendamentos?"
**Resposta Esperada:**
*   O `useMemo` serve para **otimização de performance (memorização)**.
*   A lista de bancas precisa ser exibida em ordem cronológica de data de início (`data_hora_inicio`). Sem o `useMemo`, o algoritmo de ordenação (`.sort()`) seria executado novamente a cada render da página (por exemplo, a cada caractere que o usuário digita nos campos do formulário de cadastro, já que a mudança de estado causa uma re-renderização completa).
*   Com o `useMemo`, a ordenação só é processada novamente se a lista original `agendamentos` (que está na lista de dependências) sofrer alguma alteração (como na criação ou no cancelamento de uma banca).

### ❓ "Por que vocês usaram o Vite e não o Create React App (CRA)?"
**Resposta Esperada:**
*   O Vite é consideravelmente mais rápido e moderno. Durante o desenvolvimento, o Vite não faz o *bundle* (empacotamento completo) de todo o código JavaScript antes de iniciar o servidor, ele utiliza **ES Modules (ESM)** nativos do navegador para carregar sob demanda apenas os arquivos necessários.
*   O CRA (baseado em Webpack) está obsoleto, lento para projetos que crescem e o próprio time do React não recomenda mais o seu uso oficial.

### ❓ "Como o React sabe que deve atualizar a tabela na tela quando uma banca é adicionada?"
**Resposta Esperada:**
*   Isso acontece graças ao gerenciamento de estado (`useState`). A tabela lê a variável de estado `agendamentos`.
*   Quando o fluxo de criação termina, chamamos a função `setAgendamentos(novosDados)` com a lista atualizada vinda da API. O React detecta a mudança de referência no estado e engatilha uma atualização seletiva da árvore do DOM virtual, redesenhando apenas a tabela de forma reativa.

---

## 3. Perguntas sobre Back-end & Segurança

### ❓ "O que é CORS e por que vocês tiveram que habilitá-lo no Django?"
**Resposta Esperada:**
*   **CORS (Cross-Origin Resource Sharing)** é uma política de segurança nativa dos navegadores. Por padrão, um script rodando em uma origem (ex: React em `http://localhost:5173`) é impedido de ler dados de outra origem (ex: API Django em `http://localhost:8000`).
*   Para permitir que o React se comunique com o Django localmente, precisamos configurar o pacote `django-cors-headers` no backend para enviar cabeçalhos HTTP específicos (como `Access-Control-Allow-Origin: *` ou com a origem específica do React), informando ao navegador que a API autoriza o acesso do front-end.

### ❓ "Como funciona a autenticação com JWT no projeto? Onde os tokens ficam salvos?"
**Resposta Esperada:**
*   É uma autenticação *stateless* (sem estado no servidor). Ao logar, o usuário recebe dois tokens em JSON: o **Access Token** (usado para autorizar requisições de curta duração) e o **Refresh Token** (usado para gerar novos access tokens).
*   No front-end, o Access Token está sendo guardado no `localStorage` do navegador e injetado pelo Axios em cada cabeçalho de requisição sob o formato `Authorization: Bearer <TOKEN>`.
*   *Nota de segurança:* Se o professor questionar a segurança do `localStorage`, mencione que, embora seja simples e prático de usar em ambientes acadêmicos, em um sistema corporativo real o ideal seria armazenar o token em **Cookies HttpOnly**, protegendo a aplicação contra ataques do tipo XSS (onde scripts maliciosos injetados na página podem ler o `localStorage`).

---

## 4. Perguntas sobre Banco de Dados

### ❓ "Qual a vantagem de usar o tipo UUID para a coluna `tema_tcc_id` ou chaves primárias ao invés de IDs inteiros sequenciais (1, 2, 3...)?"
**Resposta Esperada:**
*   **Segurança (Imprevisibilidade):** IDs sequenciais são fáceis de adivinhar. Um atacante poderia tentar alterar URLs ou fazer requisições variando os números (1, 2, 3...) para bisbilhotar dados (ataque de enumeração). O UUID é uma string longa e aleatória (ex: `123e4567-e89b-12d3-a456-426614174000`), impossível de adivinhar.
*   **Descentralização:** Permite criar registros com IDs únicos em diferentes bancos de dados locais e integrá-los depois sem gerar conflito ou colisão de chaves primárias duplicadas.

### ❓ "O que acontece no banco se excluirmos um registro de 'Tema de TCC' que já possui uma banca vinculada?"
**Resposta Esperada:**
*   Isso é definido pela cláusula `on_delete` na relação de chave estrangeira (ForeignKey) no arquivo `models.py` da banca.
*   Se estiver configurado como `on_delete=models.CASCADE`, o banco de dados deletará automaticamente todas as bancas associadas àquele tema excluído.
*   Se estiver configurado como `on_delete=models.PROTECT`, o banco impedirá a exclusão do Tema de TCC enquanto houver qualquer banca vinculada a ele, forçando a integridade referencial acadêmica (esta é a conduta ideal para evitar a perda de dados importantes de bancas).
