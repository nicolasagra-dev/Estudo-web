# Avaliação de Usabilidade: UX e Heurísticas de Nielsen
**Sistema de Gestão de TCC (Agendamento de Bancas) — IFAM**

Este documento apresenta uma análise detalhada de usabilidade, experiência do usuário (UX) e das 10 Heurísticas de Nielsen aplicadas à interface de agendamento de bancas de TCC, incluindo a nova funcionalidade de busca e filtragem reativa por período.

---

## 1. Análise Sistemática: As 10 Heurísticas de Nielsen

### 🟢 H1: Visibilidade do Status do Sistema
> O sistema deve sempre manter os usuários informados sobre o que está acontecendo, por meio de feedback apropriado e em tempo razoável.
*   **Aplicação no Sistema:**
    *   **Indicadores de Carregamento:** O botão de atualizar exibe "Atualizando..." e o botão de agendamento mostra "Agendando..." enquanto as chamadas assíncronas de API estão em andamento, impedindo cliques duplicados.
    *   **Estados Vazios Clariificados:** Se não há bancas agendadas no banco de dados, a tela exibe uma mensagem explícita ("Nenhuma banca agendada.").
    *   **Feedback de Filtro Vazio:** Ao aplicar um filtro que não retorna resultados, a tabela é substituída por um aviso claro ("Nenhum agendamento encontrado para os filtros selecionados."), evitando que o usuário pense que o sistema quebrou.

### 🟢 H2: Correspondência entre o Sistema e o Mundo Real
> O sistema deve falar a linguagem dos usuários, com palavras, frases e conceitos familiares a eles, em vez de termos orientados ao sistema.
*   **Aplicação no Sistema:**
    *   A interface utiliza nomenclatura puramente acadêmica familiar aos estudantes e professores do IFAM, como "Tema TCC", "Bancas agendadas", "Início", "Fim", "Local ou link", e "Cancelar agendamento".
    *   Evita expor identificadores técnicos puros (como logs de banco de dados ou stack traces) na interface do usuário final.

### 🟢 H3: Controle e Liberdade do Usuário
> Os usuários frequentemente escolhem funções do sistema por engano e precisam de uma "saída de emergência" claramente marcada para sair do estado indesejado.
*   **Aplicação no Sistema:**
    *   **Limpeza de Filtros:** O botão "Limpar" aparece dinamicamente assim que o usuário digita qualquer letra ou seleciona uma data de busca. Com um único clique, todos os filtros são limpos e a lista completa é restaurada.
    *   **Saída de Formulário:** O fluxo de agendamento pode ser abandonado a qualquer momento sem persistência indesejada. O cancelamento de bancas existentes possui um fluxo simples de clique.

### 🟢 H4: Consistência e Padrões
> Os usuários não devem ter que se perguntar se diferentes palavras, situações ou ações significam a mesma coisa. Siga as convenções da plataforma.
*   **Aplicação no Sistema:**
    *   **Identidade Visual Padrão:** O header e o rodapé seguem o padrão clássico do portal governamental do IFAM. As cores estão alinhadas com o Manual de Uso da Marca dos Institutos Federais: verde oficial (`#2f9e41`), verde escuro (`#135846`) e vermelho oficial (`#cd191e`).
    *   **Terminologia e Elementos:** Botões com ações destrutivas (como o "Cancelar" na tabela) usam consistentemente a cor vermelha suave com feedback visual ao passar o mouse.

### 🟢 H5: Prevenção de Erros
> Melhor do que boas mensagens de erro é um design cuidadoso que evita que um problema ocorra em primeiro lugar.
*   **Aplicação no Sistema:**
    *   **Controle de Inputs:** O uso de `<input type="datetime-local">` impede que o usuário digite datas em formatos inválidos ou caracteres de texto, forçando a seleção pelo calendário nativo do sistema operacional.
    *   **Confirmação de Ações Críticas:** O cancelamento de uma banca exige uma confirmação explícita (`window.confirm`) antes de enviar a requisição à API, evitando exclusões acidentais devido a cliques involuntários.
    *   **Campos Obrigatórios:** Os atributos `required` do HTML5 evitam o envio do formulário incompleto diretamente no navegador.

### 🟢 H6: Reconhecimento em vez de Recordação
> Minimize a carga de memória do usuário tornando objetos, ações e opções visíveis. O usuário não deve ter que lembrar informações de uma parte do diálogo para outra.
*   **Aplicação no Sistema:**
    *   O painel de filtros descreve claramente o que cada campo faz ("Buscar por tema ou local", "Período de início", "Período até").
    *   A tabela de bancas agendadas exibe todas as informações cruciais de uma vez (Tema, Data/Hora de Início, Fim, Local/Link) ao lado do botão de cancelamento, para que o usuário não precise clicar para visualizar detalhes da banca que deseja alterar.

### 🟢 H7: Flexibilidade e Eficiência de Uso
> Atalhos — ocultos para o usuário novato — podem frequentemente acelerar a interação para o usuário experiente, de modo que o sistema possa atender a usuários experientes e inexperientes.
*   **Aplicação no Sistema:**
    *   **Filtro Reativo Instantâneo:** O usuário não precisa clicar em um botão de "Pesquisar" ou "Buscar" e aguardar o recarregamento. A filtragem é executada no cliente em milissegundos via React (`useMemo`) enquanto o usuário digita ou altera as datas, oferecendo grande agilidade.
    *   **Links Diretos Dinâmicos:** Se o local da banca começa com "http", a tabela gera um link ancorado ("Acessar link") que abre em uma nova aba (`target="_blank"`), permitindo que o usuário entre na sala virtual sem sair do sistema acadêmico.

### 🟢 H8: Estética e Design Minimalista
> Os diálogos não devem conter informações irrelevantes ou raramente necessárias. Cada unidade extra de informação compete com as unidades relevantes de informação.
*   **Aplicação no Sistema:**
    *   **Layout em Duas Colunas:** Divisão lógica clara — Formulário de entrada no lado esquerdo (menor largura, focado) e Lista de resultados com Busca no lado direito (maior largura, leitura expandida).
    *   **Espaçamento Generoso:** O design adota espaçamentos limpos (padding e gap de 16px a 24px) que dão "respiro" à página, facilitando a leitura de tabelas densas.
    *   **Remoção de Ruídos:** Ícones e textos desnecessários (como kickers de requisitos do tipo "RF-19") foram completamente removidos para dar foco estritamente às informações operacionais do agendamento.

### 🟢 H9: Ajuda os Usuários a Reconhecerem, Diagnosticarem e Recuperarem-se de Erros
> As mensagens de erro devem ser expressas em linguagem clara (sem códigos), indicar precisamente o problema e sugerir construtivamente uma solução.
*   **Aplicação no Sistema:**
    *   **Erros Tratados:** O utilitário `getApiError(error)` extrai o conteúdo exato das mensagens de erro enviadas pelo Django REST Framework e as formata amigavelmente na tela.
    *   **Feedback Visual de Alerta:** Mensagens de sucesso usam fundo verde suave com borda verde forte, e mensagens de erro usam fundo vermelho claro com borda vermelha, facilitando a identificação imediata do estado de resposta da operação.

### 🟢 H10: Ajuda e Documentação
> Embora seja melhor se o sistema puder ser usado sem documentação, pode ser necessário fornecer ajuda e documentação.
*   **Aplicação no Sistema:**
    *   O projeto conta com o `GUIA_CONFIGURACAO_FACULDADE.md` e o `COMO_RODAR_NA_FACULDADE.md` para guiar a equipe técnica e acadêmica na instalação das dependências do ambiente Windows e PostgreSQL do laboratório.
    *   A interface traz subtítulos orientativos claros abaixo dos títulos de seção, instruindo o usuário sobre a finalidade de cada bloco (ex.: *"Gestão acadêmica de defesas — cadastre horários, local ou link..."*).

---

## 2. Experiência do Usuário (UX) & Acessibilidade (a11y)

### ♿ Acessibilidade de Cores e Contraste
*   **WCAG 2.1 AA:** O verde oficial do IF (`#2f9e41`) é vibrante e excelente para a marca, porém em textos muito pequenos sobre fundo branco pode falhar em testes de contraste estritos. Para contornar isso, o sistema utiliza o **Verde Escuro Institucional (`#135846`)** em cabeçalhos de tabelas, botões primários e links, garantindo uma relação de contraste superior a `4.5:1` para legibilidade de textos.
*   **Estados de Foco Visíveis:** Todos os campos de formulário e filtros possuem bordas que se destacam e recebem um anel de brilho suave verde (`--verde-focus`) quando focados via teclado (tecla TAB), auxiliando usuários com deficiências motoras ou visuais.

### 📱 Responsividade (Mobile & Desktop)
*   A folha de estilos `AgendamentoBancaPage.css` adota consultas de mídia (`@media`) que adaptam o grid de duas colunas para uma única coluna vertical em telas menores que `900px`. O painel de buscas se reorganiza de forma flexível (`flex-wrap`) para que os seletores de data não fiquem esmagados ou saiam da tela do celular.

---

## 3. Conclusão da Avaliação

A interface atual de agendamento de bancas apresenta excelente conformidade com as diretrizes de usabilidade moderna:
1.  **Pontos Fortes:** Feedback visual rápido, ótima prevenção de erros na seleção de datas, filtragem extremamente ágil no cliente sem recarregamento de página e excelente identidade institucional do IFAM.
2.  **Oportunidade de Melhoria:** Aumentar a flexibilidade da busca permitindo filtrar também por nome de aluno ou professores da banca caso esses dados sejam integrados no modelo do banco de dados no futuro.
