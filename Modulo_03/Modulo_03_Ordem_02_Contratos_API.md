# Contratos de API (Payloads JSON) - Módulo 3

Este documento define os contratos de dados esperados (estruturas JSON de Envio/Request e Retorno/Response) para os endpoints dos Requisitos Funcionais do **Módulo 3: Sistema de Gestão de Atividades Complementares**. 

As rotas seguem o padrão RESTful e as convenções do Django REST Framework (DRF).

---

## [RF-26] Autenticação e Cadastro de Alunos

### 1. Auto-cadastro do Aluno
**Endpoint:** `POST /api/alunos/cadastro/`

**Payload de Envio (Request):**
```json
{
  "nome_completo": "Mariana Costa Silva",
  "matricula": "202309112",
  "email": "mariana.costa@estudante.edu.br",
  "senha": "senha_segura_123",
  "curso": "Engenharia de Software"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "nome_completo": "Mariana Costa Silva",
  "matricula": "202309112",
  "email": "mariana.costa@estudante.edu.br",
  "curso": "Engenharia de Software"
}
```

### 2. Login de Aluno
**Endpoint:** `POST /api/alunos/login/`

**Payload de Envio (Request):**
```json
{
  "email": "mariana.costa@estudante.edu.br",
  "senha": "senha_segura_123"
}
```

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "def456GHI789jkl012mno...",
  "usuario": {
    "id": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
    "nome": "Mariana Costa Silva",
    "perfil": "Aluno"
  }
}
```

---

## [RF-27] Gestão de Coordenadores e Validadores
**Endpoint:** `POST /api/validadores/`

**Payload de Envio (Request):**
```json
{
  "nome_completo": "Prof. Roberto Almeida",
  "cpf": "111.222.333-44",
  "email": "roberto.almeida@instituicao.edu.br",
  "senha": "senha_validador_456"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "d2e3f4a5-6b7c-8d9e-0f1a-2b3c4d5e6f7a",
  "nome_completo": "Prof. Roberto Almeida",
  "cpf": "111.222.333-44",
  "email": "roberto.almeida@instituicao.edu.br",
  "is_ativo": true
}
```

---

## [RF-28] Gestão de Categorias e Regras de Horas
**Endpoint:** `POST /api/categorias/`

**Payload de Envio (Request):**
```json
{
  "nome": "Cursos de Extensão",
  "limite_horas": 100,
  "descricao": "Cursos extracurriculares realizados fora da grade obrigatória."
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b",
  "nome": "Cursos de Extensão",
  "limite_horas": 100,
  "descricao": "Cursos extracurriculares realizados fora da grade obrigatória."
}
```

---

## [RF-29] Submissão de Certificados (Visão Aluno)
**Endpoint:** `POST /api/certificados/`

**Campos do Formulário (Request):**
* `categoria_id`: `e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b`
* `titulo_evento`: `Minicurso de Docker e Kubernetes`
* `horas_solicitadas`: `20`
* `arquivo`: `[Arquivo Binário PDF ou JPG]`

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
  "categoria_id": "e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b",
  "titulo_evento": "Minicurso de Docker e Kubernetes",
  "horas_solicitadas": 20,
  "arquivo_url": "https://storage.instituicao.edu.br/certificados/f4a5b6c7.pdf",
  "status": "Pendente",
  "data_submissao": "2026-05-19T20:00:00Z"
}
```

---

## [RF-30] Fila de Análise de Certificados (Visão Coordenador)
**Endpoint:** `GET /api/certificados/pendentes/?page=1`

**Payload de Retorno (Response Paginado) - Sucesso (200 OK):**
```json
{
  "count": 45,
  "next": "http://api.instituicao.edu.br/certificados/pendentes/?page=2",
  "previous": null,
  "results": [
    {
      "id": "f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
      "aluno_nome": "Mariana Costa Silva",
      "titulo_evento": "Minicurso de Docker e Kubernetes",
      "horas_solicitadas": 20,
      "status": "Pendente",
      "data_submissao": "2026-05-19T20:00:00Z"
    }
  ]
}
```

---

## [RF-31] Avaliação e Concessão de Horas
**Endpoint:** `POST /api/certificados/{id_certificado}/avaliar/`

**Payload de Envio (Request):**
```json
{
  "status": "Aprovado",
  "horas_validadas": 20,
  "justificativa": ""
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id_parecer": "a5b6c7d8-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
  "certificado_id": "f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
  "status_novo": "Aprovado",
  "horas_validadas": 20,
  "data_parecer": "2026-05-19T20:30:00Z"
}
```

---

## [RF-32] Extrato Acadêmico de Horas (Visão Aluno)
**Endpoint:** `GET /api/alunos/meu-extrato/`

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "horas_totais_validadas": 120,
  "horas_restantes": 80,
  "extrato_por_categoria": [
    {
      "categoria": "Ensino",
      "horas_computadas": 50,
      "limite_categoria": 60
    },
    {
      "categoria": "Extensão",
      "horas_computadas": 70,
      "limite_categoria": 100
    }
  ]
}
```

---

## [RF-33] Sistema de Recursos (Contestação de Rejeição)
**Endpoint:** `POST /api/certificados/{id_certificado}/recurso/`

**Payload de Envio (Request):**
```json
{
  "justificativa_aluno": "A carga horária está descrita no verso do certificado, na segunda página do PDF enviado."
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id_recurso": "b6c7d8e9-0f1a-2b3c-4d5e-6f7a8b9c0d1e",
  "certificado_id": "f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
  "justificativa_aluno": "A carga horária está descrita no verso do certificado, na segunda página do PDF enviado.",
  "status_recurso": "Aberto",
  "status_certificado_novo": "Em Recurso"
}
```

---

## [RF-34] Mural de Oferta de Eventos Internos
**Endpoint:** `POST /api/eventos/`

**Payload de Envio (Request):**
```json
{
  "titulo": "Semana Acadêmica de Engenharia de Software",
  "descricao": "Palestras sobre IA, Arquitetura de Software e DevOps.",
  "categoria_id": "e3f4a5b6-7c8d-9e0f-1a2b-3c4d5e6f7a8b",
  "horas_concedidas": 15,
  "vagas_totais": 100,
  "data_evento": "2026-06-10T14:00:00Z"
}
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id": "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "titulo": "Semana Acadêmica de Engenharia de Software",
  "horas_concedidas": 15,
  "vagas_totais": 100,
  "data_evento": "2026-06-10T14:00:00Z"
}
```

---

## [RF-35] Inscrição em Eventos Internos
**Endpoint:** `POST /api/eventos/{id_evento}/inscrever/`

**Payload de Envio (Request):**
```json
{} 
```

**Payload de Retorno (Response) - Sucesso (201 Created):**
```json
{
  "id_inscricao": "d8e9f0a1-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
  "evento_id": "c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "status_presenca": false,
  "data_inscricao": "2026-05-19T21:00:00Z"
}
```

---

## [RF-36] Lista de Presença e Emissão Automática
**Endpoint:** `POST /api/eventos/{id_evento}/processar-presencas/`

**Payload de Envio (Request):**
```json
{
  "inscricoes_presentes": [
    "d8e9f0a1-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
    "e9f0a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b"
  ]
}
```

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "mensagem": "Lista de presença processada com sucesso. Horas creditadas.",
  "total_alunos_presentes": 2,
  "certificados_gerados": 2
}
```

---

## [RF-37] Relatório de Conclusão de Horas
**Endpoint:** `GET /api/alunos/{id_aluno}/aptidao-formatura/`

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "aluno_id": "c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "apto_formatura": true,
  "horas_validadas_totais": 200,
  "horas_exigidas_curso": 200,
  "mensagem": "Aluno cumpriu todas as horas exigidas e está apto para emitir o relatório de conclusão."
}
```

---

## [RF-38] Dashboard Analítico (Visão Coordenação)
**Endpoint:** `GET /api/dashboard/atividades/`

**Payload de Retorno (Response) - Sucesso (200 OK):**
```json
{
  "total_certificados_pendentes": 145,
  "alerta_gargalo_mais_7_dias": 32,
  "atividades_mais_realizadas": [
    {
      "categoria": "Extensão",
      "percentual_escolha": 65.5
    },
    {
      "categoria": "Pesquisa",
      "percentual_escolha": 20.0
    }
  ],
  "alunos_aptos_formar_mes": 15
}
```
