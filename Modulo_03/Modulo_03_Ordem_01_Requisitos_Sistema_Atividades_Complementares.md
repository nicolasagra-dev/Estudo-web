# Especificação Técnica - Módulo 3: Sistema de Gestão de Atividades Complementares

Este documento detalha os Requisitos Funcionais (RF-26 ao RF-38) do **Módulo 3: Sistema de Gestão de Atividades Complementares**, projetado para ser executado como uma fatia vertical completa (Front-end no ecossistema React e Back-end em Django REST Framework com PostgreSQL).

---

## [RF-26] Autenticação e Cadastro de Alunos
* **Responsável:** Aluno 26
* **Objetivo:** Permitir o auto-cadastro de estudantes no sistema e gerenciar a autenticação segura baseada em JWT, isolada para este módulo.
* **Regras de Negócio:**
    1. A matrícula do aluno deve ser validada como única no banco de dados.
    2. O auto-cadastro atribui automaticamente o perfil de "Aluno" ao usuário.
    3. As senhas devem ser obrigatoriamente criptografadas (Hash).
* **Relacionamentos:** Entidade base para a submissão de certificados e horas.

### Dicionário de Dados: Tabela `Aluno`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do aluno. |
| `nome_completo` | VARCHAR(150) | NOT NULL | Nome civil completo do estudante. |
| `matricula` | VARCHAR(20) | UNIQUE, NOT NULL | Registro de matrícula da instituição. |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | E-mail para acesso (login). |
| `senha_hash` | VARCHAR(255) | NOT NULL | Hash da senha. |
| `curso` | VARCHAR(100) | NOT NULL | Curso no qual o aluno está matriculado. |

---

## [RF-27] Gestão de Coordenadores e Validadores
* **Responsável:** Aluno 27
* **Objetivo:** Interface para o administrador master cadastrar os professores ou funcionários com permissão para validar horas.
* **Regras de Negócio:**
    1. O cadastro de um validador exige um CPF único.
    2. Apenas usuários com status ativo podem analisar certificados.
* **Relacionamentos:** Entidade responsável por gerar os pareceres de aprovação/rejeição.

### Dicionário de Dados: Tabela `Validador`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do validador. |
| `nome_completo` | VARCHAR(150) | NOT NULL | Nome completo do coordenador/professor. |
| `cpf` | VARCHAR(14) | UNIQUE, NOT NULL | Documento de identificação mascarado. |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | E-mail de login corporativo. |
| `senha_hash` | VARCHAR(255) | NOT NULL | Hash da senha de acesso. |
| `is_ativo` | BOOLEAN | DEFAULT TRUE | Define se o usuário tem permissão de login. |

---

## [RF-28] Gestão de Categorias e Regras de Horas
* **Responsável:** Aluno 28
* **Objetivo:** Cadastrar grupos de atividades (Ensino, Pesquisa, Extensão) e parametrizar limites de horas.
* **Regras de Negócio:**
    1. O sistema deve impedir a exclusão de uma categoria se já existirem certificados vinculados a ela.
    2. O limite de horas cadastrado servirá de teto na consolidação do extrato do aluno.
* **Relacionamentos:** Uma `CategoriaAtividade` agrupa múltiplos `Certificado` (1:N).

### Dicionário de Dados: Tabela `CategoriaAtividade`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da categoria. |
| `nome` | VARCHAR(100) | UNIQUE, NOT NULL | Ex: 'Pesquisa', 'Cursos de Extensão'. |
| `limite_horas` | INTEGER | NOT NULL | Máximo de horas aproveitáveis no curso para esta categoria. |
| `descricao` | TEXT | NULL | Detalhamento das regras de aceitação. |

---

## [RF-29] Submissão de Certificados (Visão Aluno)
* **Responsável:** Aluno 29
* **Objetivo:** Fornecer um formulário para o aluno preencher os dados do evento e fazer o upload do documento comprobatório.
* **Regras de Negócio:**
    1. O envio do arquivo (PDF ou Imagem) é estritamente obrigatório.
    2. Todo certificado submetido recebe automaticamente o status 'Pendente'.
* **Relacionamentos:** Um `Aluno` envia vários `Certificado` (1:N).

### Dicionário de Dados: Tabela `Certificado`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da submissão. |
| `aluno_id` | UUID | FK, NOT NULL | Chave estrangeira para o estudante. |
| `categoria_id` | UUID | FK, NOT NULL | Chave estrangeira para o grupo da atividade. |
| `titulo_evento` | VARCHAR(200) | NOT NULL | Nome do curso, palestra ou atividade. |
| `horas_solicitadas`| INTEGER | NOT NULL | Carga horária impressa no documento original. |
| `arquivo_url` | VARCHAR(255) | NOT NULL | Caminho/URL do arquivo físico salvo no servidor/S3. |
| `status` | VARCHAR(30) | DEFAULT 'Pendente'| Valores: 'Pendente', 'Aprovado', 'Rejeitado', 'Em Recurso'. |
| `data_submissao` | TIMESTAMP | DEFAULT NOW() | Data do envio do documento. |

---

## [RF-30] Fila de Análise de Certificados (Visão Coordenador)
* **Responsável:** Aluno 30
* **Objetivo:** Exibir uma listagem (Lista/Kanban) dos certificados pendentes, permitindo filtros por curso ou aluno.
* **Regras de Negócio:**
    1. A API deve obrigatoriamente implementar paginação (*Server-side pagination*).
    2. O sistema deve registrar o histórico de quem visualizou ou alterou os estados das solicitações.
* **Relacionamentos:** Cada alteração no `Certificado` gera um registro em `HistoricoAnalise`.

### Dicionário de Dados: Tabela `HistoricoAnalise`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do log. |
| `certificado_id` | UUID | FK, NOT NULL | Certificado alvo da ação. |
| `validador_id` | UUID | FK, NOT NULL | Coordenador que efetuou a movimentação. |
| `status_anterior` | VARCHAR(30) | NOT NULL | Estado antes da mudança. |
| `status_novo` | VARCHAR(30) | NOT NULL | Novo estado aplicado. |
| `data_acao` | TIMESTAMP | DEFAULT NOW() | Momento da alteração de status. |

---

## [RF-31] Avaliação e Concessão de Horas
* **Responsável:** Aluno 31
* **Objetivo:** Tela para o validador visualizar o arquivo enviado, deferir ou indeferir o pedido, com a possibilidade de aprovar horas parciais.
* **Regras de Negócio:**
    1. Se aprovado, o validador deve confirmar as `horas_validadas` (que podem ser menores que as solicitadas).
    2. Se rejeitado, o preenchimento da justificativa é obrigatório.
* **Relacionamentos:** Um `Certificado` recebe um `ParecerValidacao` (1:1).

### Dicionário de Dados: Tabela `ParecerValidacao`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do parecer. |
| `certificado_id` | UUID | FK, UNIQUE | Certificado avaliado. |
| `validador_id` | UUID | FK, NOT NULL | Quem gerou o parecer. |
| `horas_validadas` | INTEGER | DEFAULT 0 | Quantidade de horas efetivamente computadas. |
| `justificativa` | TEXT | NULL | Motivo da rejeição ou de glosa parcial das horas. |
| `data_parecer` | TIMESTAMP | DEFAULT NOW() | Data da finalização da análise. |

---

## [RF-32] Extrato Acadêmico de Horas (Visão Aluno)
* **Responsável:** Aluno 32
* **Objetivo:** Fornecer um painel de acompanhamento (barras de progresso) para o aluno visualizar o quanto falta para se formar.
* **Regras de Negócio:**
    1. Sem criação de novas tabelas; consumo de agregadores SQL (ex: `SUM(horas_validadas) GROUP BY categoria`).
    2. A soma por categoria não pode ultrapassar o teto estipulado em `CategoriaAtividade.limite_horas` na entrega do JSON.

### Contrato de Dados Esperado (Payload JSON de Retorno da API)
```json
{
  "horas_totais_validadas": 120,
  "horas_restantes": 80,
  "extrato_por_categoria": [
    { "categoria": "Ensino", "horas_computadas": 50, "limite_categoria": 60 },
    { "categoria": "Extensão", "horas_computadas": 70, "limite_categoria": 100 }
  ]
}

---

## [RF-33] Sistema de Recursos (Contestação de Rejeição)
* **Responsável:** Aluno 33
* **Objetivo:** Permitir que o aluno conteste a rejeição de um certificado mediante nova justificativa textual.
* **Regras de Negócio:**
    1. O aluno só pode abrir recurso para certificados com status 'Rejeitado'.
    2. Ao abrir o recurso, o status do `Certificado` muda para 'Em Recurso'.
* **Relacionamentos:** Um `Certificado` pode ter um `RecursoCertificado` (1:1).

### Dicionário de Dados: Tabela `RecursoCertificado`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do processo de recurso. |
| `certificado_id` | UUID | FK, UNIQUE | Certificado contestado. |
| `justificativa_aluno`| TEXT | NOT NULL | Defesa ou nova explicação enviada pelo aluno. |
| `parecer_coordenador`| TEXT | NULL | Resposta final do validador. |
| `status_recurso` | VARCHAR(30) | DEFAULT 'Aberto' | Valores: 'Aberto', 'Deferido', 'Indeferido'. |
| `data_abertura` | TIMESTAMP | DEFAULT NOW() | Data da abertura do protocolo. |

---

## [RF-34] Mural de Oferta de Eventos Internos
* **Responsável:** Aluno 34
* **Objetivo:** Permitir a divulgação de palestras e minicursos internos da faculdade que geram horas automáticas.
* **Regras de Negócio:**
    1. O evento deve possuir um limite fixo de vagas.
    2. O total de horas configurado no evento é o padrão que será concedido aos presentes.
* **Relacionamentos:** Um `Validador` cadastra um `EventoInterno` (1:N).

### Dicionário de Dados: Tabela `EventoInterno`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único do evento institucional. |
| `titulo` | VARCHAR(200) | NOT NULL | Nome da palestra ou minicurso. |
| `descricao` | TEXT | NOT NULL | Resumo do evento. |
| `categoria_id` | UUID | FK, NOT NULL | Em qual categoria as horas irão pontuar. |
| `horas_concedidas` | INTEGER | NOT NULL | Quantidade de horas que o evento vale. |
| `vagas_totais` | INTEGER | NOT NULL | Limite de inscrições ativas. |
| `data_evento` | TIMESTAMP | NOT NULL | Data e hora em que a atividade ocorrerá. |

---

## [RF-35] Inscrição em Eventos Internos
* **Responsável:** Aluno 35
* **Objetivo:** O aluno clica no mural para se inscrever e garantir sua vaga.
* **Regras de Negócio:**
    1. A API deve bloquear novas inscrições se `COUNT(inscricoes) >= vagas_totais`.
    2. Um aluno não pode se inscrever duas vezes no mesmo evento.
* **Relacionamentos:** Tabela associativa entre `EventoInterno` e `Aluno` (N:M).

### Dicionário de Dados: Tabela `InscricaoEvento`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da inscrição. |
| `evento_id` | UUID | FK, NOT NULL | Evento interno selecionado. |
| `aluno_id` | UUID | FK, NOT NULL | Estudante que reservou a vaga. |
| `status_presenca` | BOOLEAN | DEFAULT FALSE | Flag marcada apenas no dia do evento (check-in). |
| `data_inscricao` | TIMESTAMP | DEFAULT NOW() | Momento da confirmação da vaga. |
| `unique_inscricao` | CONSTRAINT | UNIQUE(evento, aluno)| O aluno só se inscreve 1 vez por evento. |

---

## [RF-36] Lista de Presença e Emissão Automática
* **Responsável:** Aluno 36
* **Objetivo:** O validador marca presença dos inscritos (check-in virtual) e o sistema automatiza o crédito das horas.
* **Regras de Negócio:**
    1. Ao processar a lista (batch/lote), a flag `status_presenca` na tabela `InscricaoEvento` vai para TRUE.
    2. A API de Back-end gera automaticamente registros na tabela `Certificado` (com URL nula ou gerada internamente) e status 'Aprovado' já alimentando o `ParecerValidacao`.
* **Relacionamentos:** Integração lógica entre os RFs 34, 35 e 31. Não há criação de novas tabelas.

---

## [RF-37] Relatório de Conclusão de Horas
* **Responsável:** Aluno 37
* **Objetivo:** Gerar o documento PDF oficial de quitação que o aluno entrega para a colação de grau.
* **Regras de Negócio:**
    1. O PDF só pode ser gerado caso a soma total de horas respeitando os limites seja `>=` à exigência total do curso.
    2. O documento deve trazer os dados do aluno listando o somatório aprovado por categoria, utilizando bibliotecas (ex: ReportLab/WeasyPrint).
* **Relacionamentos:** Leitura consolidada. Requisito focado em formatação de documento e validação lógica final.

---

## [RF-38] Dashboard Analítico (Visão Coordenação)
* **Responsável:** Aluno 38
* **Objetivo:** Entregar aos gestores uma visão global de gargalos e comportamentos de atividades.
* **Regras de Negócio:**
    1. Criar consultas SQL que cruzem datas para encontrar gargalos (ex: "Certificados pendentes há mais de 7 dias").
    2. Entregar uma estrutura JSON consumível pelas bibliotecas de gráficos do React (ex: Recharts, Chart.js).

### Contrato de Dados Esperado (Payload JSON de Retorno da API)
```json
{
  "total_certificados_pendentes": 145,
  "alerta_gargalo_mais_7_dias": 32,
  "atividades_mais_realizadas": [
    { "categoria": "Extensão", "percentual_escolha": 65.5 },
    { "categoria": "Pesquisa", "percentual_escolha": 20.0 }
  ],
  "alunos_aptos_formar_mes": 15
}