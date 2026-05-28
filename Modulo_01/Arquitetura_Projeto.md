# Documento de Especificação de Projeto Prático
**Curso:** Bacharelado em Engenharia de Software
**Disciplinas Envolvidas:** Desenvolvimento Front-end, Desenvolvimento Back-end, Banco de Dados

---

## 1. Visão Geral do Projeto
Este documento define as diretrizes e o escopo do Projeto Prático a ser desenvolvido por uma turma de 38 alunos de Engenharia de Software. O objetivo é simular um ambiente real de desenvolvimento de software, onde a turma trabalhará em conjunto para construir uma plataforma acadêmica completa.

Para garantir a divisão justa e o acompanhamento individual, o projeto foi segmentado em **Três Módulos Independentes** (fatias verticais). Cada aluno é responsável por desenvolver de ponta a ponta (Banco de Dados, API e Interface) pelo menos um Requisito Funcional (RF) do sistema.

## 2. Stack Tecnológica Base
A padronização tecnológica é obrigatória para facilitar a integração final entre os sistemas:
* **Front-end:** React.js (inicializado via Vite), utilizando Axios para consumo de APIs e React Router DOM para navegação.
* **Back-end:** Python com Django REST Framework (DRF).
* **Autenticação:** Tokens JWT (JSON Web Token).
* **Banco de Dados:** PostgreSQL (Relacional).
* **Arquitetura da API:** RESTful, com comunicação estrita via payloads em formato JSON.

---

## 3. Divisão dos Módulos e Escopo

### Módulo 1: Sistema de Alocação de Recursos Didáticos
* **Equipe:** Alunos 01 ao 12
* **Requisitos:** [RF-01] ao [RF-12]
* **Contexto:** Plataforma para controle de inventário físico do departamento. Permite que professores solicitem agendamentos (carrinho de reservas) de recursos como Datashows, Notebooks e Cabos, enquanto os funcionários administrativos aprovam, fazem o check-out (retirada), check-in (devolução) e gerenciam manutenções.

### Módulo 2: Sistema de Gestão de TCC e Bancas
* **Equipe:** Alunos 13 ao 25
* **Requisitos:** [RF-13] ao [RF-25]
* **Contexto:** Ambiente de controle do ciclo de vida dos Trabalhos de Conclusão de Curso. Engloba submissão de temas, aceite de orientadores, upload de versões de monografia, agendamento logístico de bancas examinadoras, painel de lançamento de notas pelos avaliadores e emissão automatizada da ata de defesa.

### Módulo 3: Sistema de Gestão de Atividades Complementares
* **Equipe:** Alunos 26 ao 38
* **Requisitos:** [RF-26] ao [RF-38]
* **Contexto:** Plataforma para submissão, auditoria e contabilização de horas extracurriculares. Os alunos enviam certificados (em PDF/Imagem) que caem em uma fila de triagem. Coordenadores validam os documentos concedendo as horas. O sistema também gerencia a inscrição em eventos internos que geram certificados automaticamente após o check-in (lista de presença).

---

## 4. Metodologia de Integração
* Cada módulo operará com seu próprio banco de dados isolado (`modulo1_alocacao`, `modulo2_tcc`, `modulo3_atividades`).
* O mapeamento e serialização dos dados foram previamente definidos através de **Contratos de API (Payloads JSON)**, garantindo que as equipes de Front-end e Back-end trabalhem de forma assíncrona, porém alinhada aos mesmos padrões de entrada e saída.