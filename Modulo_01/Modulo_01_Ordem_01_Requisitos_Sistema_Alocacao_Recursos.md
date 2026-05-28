# Especificação Técnica - Módulo 1: Sistema de Alocação de Recursos Didáticos

Este documento detalha os Requisitos Funcionais (RF-01 ao RF-12) do **Módulo 1: Sistema de Alocação de Recursos Didáticos**, projetado para ser executado como uma fatia vertical completa (Front-end no ecossistema React e Back-end em Django REST Framework com PostgreSQL) por alunos do curso de Bacharelado em Engenharia de Software.

---

## [RF-01] Autenticação e Controle de Acesso
* **Responsável:** Aluno 01
* **Objetivo:** Garantir a entrada segura no sistema, autenticando os usuários via token JWT e determinando seus níveis de permissão com base em perfis de acesso estruturados (RBAC).
* **Regras de Negócio:**
    1. As senhas devem ser armazenadas obrigatoriamente utilizando algoritmos de criptografia de hash seguro (ex: Bcrypt / PBKDF2 padrão do Django).
    2. O token JWT de acesso retornado após o login bem-sucedido terá validade máxima de 2 horas.
    3. A exclusão de um perfil de acesso (Role) não é permitida se houver usuários ativos vinculados a ele (Proteção de Integridade Restrita).
* **Relacionamentos:** Um `PerfilAcesso` pode estar associado a vários `Usuario` (Relacionamento 1:N).

### Dicionário de Dados: Tabela `PerfilAcesso`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do perfil de acesso. |
| `nome` | VARCHAR(50) | UNIQUE, NOT NULL | Nome descritivo do perfil (ex: 'Administrador', 'Professor', 'Funcionario'). |
| `descricao` | VARCHAR(255) | NULL | Detalhamento sobre as permissões granulares que o perfil possui. |

### Dicionário de Dados: Tabela `Usuario`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do usuário. |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | E-mail corporativo ou institucional do usuário (utilizado como credencial de login). |
| `senha_hash` | VARCHAR(255) | NOT NULL | String hash resultante da criptografia da senha. |
| `ativo` | BOOLEAN | DEFAULT TRUE | Define se o usuário está autorizado a realizar login no sistema. |
| `perfil_id` | UUID | FK | Chave estrangeira que referencia a tabela `PerfilAcesso`. |

---

## [RF-02] Gestão de Professores
* **Responsável:** Aluno 02
* **Objetivo:** Manter o registro atualizado dos docentes da instituição que atuarão diretamente como locatários dos recursos didáticos do departamento.
* **Regras de Negócio:**
    1. A matrícula do professor deve ser estritamente única em todo o sistema.
    2. Ao inativar o cadastro de um professor, suas reservas futuras devem ser listadas para avaliação e cancelamento manual (o sistema não deve excluí-las sem rastro).
    3. Todo professor cadastrado deve possuir uma conta correspondente e obrigatória na tabela de usuários para autenticação.
* **Relacionamentos:** Um `Usuario` possui uma extensão de dados na tabela `Professor` (Relacionamento 1:1).

### Dicionário de Dados: Tabela `Professor`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do registro do professor. |
| `nome_completo` | VARCHAR(150) | NOT NULL | Nome civil completo do docente. |
| `matricula` | VARCHAR(20) | UNIQUE, NOT NULL | Código de registro funcional/acadêmico emitido pela instituição. |
| `departamento` | VARCHAR(100) | NOT NULL | Lotação do professor (ex: 'Departamento de Computação', 'Saúde'). |
| `usuario_id` | UUID | FK, UNIQUE, NOT NULL| Chave estrangeira de vinculação única com o registro na tabela `Usuario`. |

---

## [RF-03] Gestão de Funcionários Administrativos
* **Responsável:** Aluno 03
* **Objetivo:** Cadastrar e gerenciar os dados dos funcionários lotados no departamento administrativo, responsáveis pela entrega, recepção e auditoria física dos recursos didáticos.
* **Regras de Negócio:**
    1. O funcionário administrativo só poderá registrar movimentações físicas (Check-out e Check-in) se seu status de usuário estiver marcado como ativo.
    2. O cadastro exige vinculação obrigatória e única a uma entidade de login do sistema.
* **Relacionamentos:** Um `Usuario` possui uma extensão de dados na tabela `Funcionario` (Relacionamento 1:1).

### Dicionário de Dados: Tabela `Funcionario`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do funcionário administrativo. |
| `nome_completo` | VARCHAR(150) | NOT NULL | Nome completo do servidor técnico-administrativo. |
| `cpf` | VARCHAR(14) | UNIQUE, NOT NULL | Cadastro de Pessoa Física devidamente validado e mascarado. |
| `cargo` | VARCHAR(100) | NOT NULL | Cargo ou função ocupada (ex: 'Assistente Técnico de Laboratório'). |
| `usuario_id` | UUID | FK, UNIQUE, NOT NULL| Chave estrangeira de vinculação única com o registro na tabela `Usuario`. |

---

## [RF-04] Gestão de Categorias de Recursos
* **Responsável:** Aluno 04
* **Objetivo:** Criar divisões lógicas estruturadas para agrupar equipamentos de mesma natureza e parametrizar regras globais de empréstimo por grupo.
* **Regras de Negócio:**
    1. Nenhuma categoria de recurso pode ser removida do sistema enquanto houver registros de unidades físicas associados a ela.
    2. O atributo de tempo máximo de empréstimo é cumulativo por reserva e servirá de base para travar o carrinho de pedidos no Front-end.
* **Relacionamentos:** Uma `CategoriaRecurso` pode possuir múltiplos registros associados na tabela `Equipamento` (Relacionamento 1:N).

### Dicionário de Dados: Tabela `CategoriaRecurso`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal da categoria. |
| `nome` | VARCHAR(100) | UNIQUE, NOT NULL | Nome do grupo do recurso didático (ex: 'Notebook', 'Datashow', 'Cabo HDMI'). |
| `tempo_max_horas` | INTEGER | NOT NULL | Limite padrão de horas contínuas concedidas para o empréstimo dessa categoria. |
| `requer_aprovacao` | BOOLEAN | DEFAULT FALSE | Flag que determina se a categoria necessita obrigatoriamente de liberação humana. |

---

## [RF-05] Gestão do Inventário Físico (Patrimônio)
* **Responsável:** Aluno 05
* **Objetivo:** Cadastrar, auditar e controlar de forma individualizada cada unidade física de recurso disponível na instituição de ensino.
* **Regras de Negócio:**
    1. O número de patrimônio (tombamento institucional) é o identificador visual obrigatório do item e jamais pode se repetir.
    2. Itens físicos marcados com o status 'Manutenção' ou 'Inativo' devem ser imediatamente excluídos de qualquer consulta de disponibilidade para novas reservas.
* **Relacionamentos:** Múltiplos registros da tabela `Equipamento` apontam para uma única categoria em `CategoriaRecurso` (Relacionamento N:1).

### Dicionário de Dados: Tabela `Equipamento`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal da unidade física do equipamento. |
| `num_patrimonio` | VARCHAR(50) | UNIQUE, NOT NULL | Código único de tombamento patrimonial da instituição. |
| `modelo` | VARCHAR(100) | NOT NULL | Detalhamento de marca e modelo do ativo (ex: 'Dell Inspiron 15 5000'). |
| `status` | VARCHAR(30) | NOT NULL | Estado atual do item. Valores: 'Disponivel', 'Em Uso', 'Manutenção', 'Inativo'. |
| `categoria_id` | UUID | FK, NOT NULL | Chave estrangeira que conecta o item físico à sua `CategoriaRecurso`. |

---

## [RF-06] Solicitação de Reserva (Visão Professor)
* **Responsável:** Aluno 06
* **Objetivo:** Disponibilizar uma interface web e rotas onde o docente consiga montar um "carrinho" de solicitações de equipamentos para uma data e intervalo de horários específicos.
* **Regras de Negócio:**
    1. Bloqueio de Concorrência Espacial/Temporal: Um item patrimonial não pode fazer parte de duas reservas distintas cujos intervalos de horários se sobreponham.
    2. O sistema deve impedir, via validação no Back-end, a criação de qualquer agendamento com data ou hora retroativa.
    3. Toda nova solicitação criada pelo usuário docente entra na base com o estado inicial fixado em 'Pendente'.
* **Relacionamentos:** * Um `Professor` pode submeter várias entidades da tabela `Reserva` (1:N).
    * Uma `Reserva` possui múltiplos registros na tabela intermediária `ReservaItem`, que por sua vez aponta para um `Equipamento` específico (Mapeamento N:M através de tabela associativa).

### Dicionário de Dados: Tabela `Reserva`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal da solicitação de reserva. |
| `data_retirada` | TIMESTAMP | NOT NULL | Data e hora exatas planejadas para o início da utilização do recurso. |
| `data_devolucao` | TIMESTAMP | NOT NULL | Data e hora máximas acordadas para a devolução física do item. |
| `status` | VARCHAR(30) | NOT NULL | Estado da solicitação. Valores: 'Pendente', 'Aprovada', 'Rejeitada', 'Concluída'. |
| `professor_id` | UUID | FK, NOT NULL | Chave estrangeira que referencia o `Professor` solicitante. |
| `criado_em` | TIMESTAMP | DEFAULT NOW() | Carimbo de data/hora do momento em que a reserva deu entrada no sistema. |

### Dicionário de Dados: Tabela `ReservaItem` (Tabela Associativa)
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único da linha da tabela associativa. |
| `reserva_id` | UUID | FK, NOT NULL | Chave estrangeira conectada à tabela master de `Reserva`. |
| `equipamento_id` | UUID | FK, NOT NULL | Chave estrangeira conectada à unidade física em `Equipamento`. |

---

## [RF-07] Gestão de Reservas (Visão Administrativo)
* **Responsável:** Aluno 07
* **Objetivo:** Fornecer uma visão unificada para os funcionários do balcão administrarem o fluxo de triagem de pedidos, aprovando ou recusando as solicitações.
* **Regras de Negócio:**
    1. Uma alteração para o status 'Aprovada' só pode ser processada se todas as unidades físicas vinculadas aos itens da reserva estiverem com o status 'Disponivel'.
    2. Caso o funcionário mude o status para 'Rejeitada', o preenchimento do campo descritivo de justificativa torna-se estritamente obrigatório.
    3. Cada transição de estado deve gerar uma trilha de auditoria contendo o carimbo do usuário técnico responsável.
* **Relacionamentos:** Uma `Reserva` pode registrar múltiplos estados na tabela `HistoricoStatusReserva` (1:N). O `Funcionario` gera a alteração.

### Dicionário de Dados: Tabela `HistoricoStatusReserva`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do registro de histórico. |
| `reserva_id` | UUID | FK, NOT NULL | Chave estrangeira apontando para a `Reserva` modificada. |
| `funcionario_id` | UUID | FK, NOT NULL | Chave estrangeira identificando o `Funcionario` que realizou a ação. |
| `status_novo` | VARCHAR(30) | NOT NULL | Novo estado atribuído ('Aprovada' ou 'Rejeitada'). |
| `justificativa` | TEXT | NULL | Descrição do motivo da rejeição (Obrigatoriamente preenchido se status for Rejeitada). |
| `data_acao` | TIMESTAMP | DEFAULT NOW() | Carimbo exato de data e hora em que a triagem foi executada. |

---

## [RF-08] Registro de Retirada (Check-out)
* **Responsável:** Aluno 08
* **Objetivo:** Registrar formalmente o momento em que o professor retira os equipamentos fisicamente no balcão de atendimento, iniciando a posse temporária dos bens.
* **Regras de Negócio:**
    1. O processo de check-out é exclusivo para registros de reservas que possuam o status atualizado de 'Aprovada'.
    2. Na confirmação do check-out, o status do registro pai em `Reserva` migra para 'Em Andamento', e todos os equipamentos atrelados a ela em `Equipamento` mudam o status para 'Em Uso'.
* **Relacionamentos:** Uma `Reserva` emite exatamente um único registro na tabela de movimentação de `Emprestimo` (1:1).

### Dicionário de Dados: Tabela `Emprestimo`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do evento de check-out/empréstimo. |
| `reserva_id` | UUID | FK, UNIQUE, NOT NULL| Chave estrangeira de ligação unívoca com a `Reserva` de origem. |
| `funcionario_entrega_id`| UUID | FK, NOT NULL | Chave estrangeira identificando o `Funcionario` que efetuou a entrega em mãos. |
| `data_retirada_real` | TIMESTAMP | NOT NULL | Data e hora reais registradas no momento em que os ativos saíram do balcão. |
| `observacao_saida` | VARCHAR(255)| NULL | Apontamentos físicos feitos na saída (ex: 'Equipamento sem cabo carregador reserva'). |

---

## [RF-09] Registro de Devolução (Check-in e Ocorrências)
* **Responsável:** Aluno 09
* **Objetivo:** Processar o retorno físico dos equipamentos ao setor, realizando a baixa patrimonial, checagem de integridade e verificação de cumprimento de prazos.
* **Regras de Negócio:**
    1. Ao efetuar o encerramento do empréstimo, o status de cada `Equipamento` retorna para 'Disponivel' (ou migra para 'Manutenção' caso avarias sejam reportadas).
    2. O status final da `Reserva` migra para 'Concluída'.
    3. O algoritmo da API no Django deve calcular o delta entre `data_devolucao_real` e a `data_devolucao` prevista e assinalar a flag de atraso caso o tempo limite tenha sido violado.
* **Relacionamentos:** Um evento de `Emprestimo` recebe exatamente um registro de fechamento na tabela `Devolucao` (1:1).

### Dicionário de Dados: Tabela `Devolucao`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal da devolução realizada. |
| `emprestimo_id` | UUID | FK, UNIQUE, NOT NULL| Chave estrangeira de vinculação de encerramento vinculada ao `Emprestimo`. |
| `funcionario_recebe_id`| UUID | FK, NOT NULL | Chave estrangeira que identifica o `Funcionario` que inspecionou o retorno. |
| `data_devolucao_real` | TIMESTAMP | NOT NULL | Data e hora exatas do recebimento físico dos itens no balcão. |
| `houve_atraso` | BOOLEAN | DEFAULT FALSE | Campo booleano computado em tempo de execução pela controller do Back-end. |
| `estado_conservacao` | VARCHAR(50) | NOT NULL | Parecer técnico do recebimento. Valores: 'Perfeito', 'Danificado', 'Faltam Pecas'. |

---

## [RF-10] Dashboard de Inventário em Tempo Real
* **Responsável:** Aluno 10
* **Objetivo:** Agregar e consolidar dados espalhados no PostgreSQL para renderizar um painel analítico dinâmico, fornecendo indicadores vitais sobre os ativos para os gestores.
* **Regras de Negócio:**
    1. Devido à sua natureza puramente analítica de Business Intelligence, este requisito **não criará novas tabelas relacionais** na base de dados.
    2. O aluno é estritamente responsável pelo desenvolvimento de queries SQL performáticas com agrupamento e funções agregadas (`COUNT`, `SUM`, `GROUP BY`) via Django ORM ou SQL Puro.
    3. A API gerada deve retornar um payload estruturado exclusivamente em formato JSON contendo o somatório global de itens por status, distribuição volumétrica por categorias e a quantidade de devoluções pendentes em atraso na data corrente.

### Contrato de Dados Esperado (Payload JSON de Retorno da API)
```json
{
  "total_equipamentos_ativos": 150,
  "equipamentos_em_uso": 42,
  "equipamentos_manutencao": 8,
  "reservas_atrasadas_hoje": 3,
  "grafico_uso_por_categoria": [
    { "categoria": "Notebook", "quantidade_em_uso": 25 },
    { "categoria": "Datashow", "quantidade_em_uso": 12 },
    { "categoria": "Cabo HDMI", "quantidade_em_uso": 5 }
  ]
}

---

## [RF-11] Relatório de Empréstimos e Atrasos
* **Responsável:** Aluno 11
* **Objetivo:** Disponibilizar um mecanismo de auditoria histórica de movimentações físicas dotado de filtros avançados com capacidade de exportação em PDF.
* **Regras de Negócio:**
    1. O endpoint HTTP deve aceitar múltiplos parâmetros de consulta combinados (*Query Parameters*) na URL (ex: filtros por intervalo de datas, ID de professor e flag de atrasos).
    2. A paginação de dados do lado do servidor (Server-side pagination) é obrigatória para evitar sobrecarga de memória na serialização de dados JSON de resposta.
    3. O aluno deve acoplar uma biblioteca de renderização documental (ex: ReportLab ou WeasyPrint em ambiente Python) para montar e retornar o stream de um arquivo binário **PDF** formatado com os dados filtrados.
* **Relacionamentos:** Consome dados consolidados através de cláusulas JOIN entre as tabelas `Reserva`, `Emprestimo`, `Devolucao` e `Professor` (Puramente operacional, não cria tabelas persistentes adicionais).

### Estrutura de Filtros de Entrada Aceitos pela API (Query Parameters)
* `data_inicio` / `data_fim` (Filtro por período de retirada)
* `status_reserva` (Filtragem por estados lógicos)
* `apenas_com_atraso` (Filtro booleano para auditoria de violações de prazos)
* `professor_id` (Isolamento de histórico por docente)

---

## [RF-12] Sistema de Ocorrências e Manutenção
* **Responsável:** Aluno 12
* **Objetivo:** Controlar e documentar o ciclo de vida de reparos, incidentes críticos e manutenções corretivas ou preventivas realizadas nas unidades físicas do inventário.
* **Regras de Negócio:**
    1. No ato de abertura de um registro de manutenção, o sistema deve forçar um gatilho de atualização na tabela `Equipamento`, alterando o status do item físico para 'Manutenção'.
    2. Enquanto o chamado de reparo permanecer em aberto, o item ficará terminantemente bloqueado para novas operações de reserva de professores.
    3. O ativo físico só retornará ao estado de 'Disponivel' após o preenchimento de um parecer de conclusão e alteração do status do chamado para 'Resolvido'.
* **Relacionamentos:** Um `Equipamento` pode sofrer intervenções e acumular múltiplos registros na tabela `ChamadoManutencao` (Relacionamento 1:N).

### Dicionário de Dados: Tabela `ChamadoManutencao`
| Atributo | Tipo (PostgreSQL) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Identificador único universal do chamado de manutenção. |
| `equipamento_id` | UUID | FK, NOT NULL | Chave estrangeira que referencia qual unidade física de `Equipamento` está danificada. |
| `descricao_defeito` | TEXT | NOT NULL | Relato detalhado do vício ou quebra apresentado pelo equipamento didático. |
| `data_abertura` | TIMESTAMP | DEFAULT NOW() | Carimbo de data e hora do início do processo de manutenção. |
| `data_resolucao` | TIMESTAMP | NULL | Carimbo de data e hora preenchido apenas no encerramento e quitação do reparo. |
| `status` | VARCHAR(30) | NOT NULL | Estado do chamado. Valores: 'Aberto', 'Em Conserto', 'Resolvido', 'Irreparável'. |
| `custo_reparo` | NUMERIC(10,2) | NULL | Valor financeiro total despendido no conserto do ativo didático (opcional). |