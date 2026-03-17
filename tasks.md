- [ ] Estruturar as interfaces da aplicação mobile (login, cadastro e tela de chat) (FM) (Julia)
- [ ] Estruturar as interfaces da aplicação web (login, cadastro e chat do atendente) (FW) (Mafe)
- [ ] Frontend Biblioteca - Integração do frontend com o backend
- [ ] Criar Chat: troca de mensagens
- [ ] Criar Chat: carregar histórico de mensagens
- [ ] Login e Cadastro do atendente e do cliente
- [ ] Carregar os atendimentos
- [ ] Modelar os dados (Tabelas/Coleções) no Banco de Dados: `Usuários` (Solicitante/Atendente), `Atendimento`, `Conversas` e `Mensagens`. (BACK)
- [ ] Criar a estrutura básica da REST API: set up do FastAPI, comunicação com BDs, Docker, linting etc (BACK) (Pedro)
- [ ] definir/documentar os contratos de API (rotas REST e eventos do WebSocket - payloads de envio e recebimento) (BACK)
- [ ] Criar endpoint REST para histórico de mensagens de uma conversa com paginação. (BACK)
- [ ] Integrar chamada REST para carregar o histórico de mensagens ao abrir a tela de chat. (FRONT)
- [ ] Criar o chat: troca de mensagens via WebSocket, com gerenciamento de salas por atendimento e persistência das mensagens no banco. (BACK) (Pedro)
- [ ] Integrar cliente WebSocket no mobile e no web para envio e recebimento de mensagens em tempo real (FRONT)

- [ ] US02 - Responder perguntas em uma triagem automatizada (ainda na interface de chat)
- [ ] Desenhar fluxograma da URA documentando exatamente os nós de decisão (Saudação - Categoria do Problema - FAQ sugerida - Transbordo/Fim). (DOC)
      (Algo que provavelmente não precisa se tornar uma task, que é melhor definir em conjunto:
      Definir conteúdo da triagem para o MVP: Definir 3 categorias de problemas comuns.
      E depois disso a pessoa responsável por escrever os FAQs pode atuar.)
- [ ] Escrever 1 FAQ associada a cada categoria de problemas da Triagem. (DOC)
- [ ] Modelar no Banco de Dados a estrutura para armazenar as "Respostas da Triagem" vinculadas ao ID do Atendimento. (BACK)
- [ ] Definir o contrato do Payload (JSON) entre Backend e Mobile. O backend precisa enviar metadados informando se a mensagem do bot exige texto livre ou clique em botões (Quick Replies). (BACK)
- [ ] Implementar a migration/tabela para persistir o histórico de opções selecionadas pelo Solicitante durante a triagem. (BACK)
- [ ] Desenvolver o "Motor da URA" no backend: um serviço (máquina de estados) que avalia a resposta do usuário e devolve a próxima pergunta do fluxograma ou a FAQ correspondente. (BACK)
- [ ] Implementar lógica de transbordo (Handover): Se a FAQ não resolver, o sistema altera o status do Atendimento para `Aberto` (Aguardando Humano), emite um evento no WebSocket para os atendentes e encerra a interação com o bot. (BACK)
- [ ] Modificar o componente de mensagens do chat no React Native para renderizar o avatar/nome de "Bot/Assistente Virtual" de forma distinta do atendente humano. Também desenvolver o componente UI de "Quick Replies" (Botões de opções) na tela de chat para o Solicitante clicar nas categorias em vez de digitar. (FM) (Julia)
- [ ] Integrar o envio da opção selecionada (clique do botão) para o backend através do mesmo canal de WebSocket/REST estabelecido na US-01 (FRONT)
- [ ] Adaptar o painel Web do Atendente (React) para exibir as mensagens geradas pelo Bot e as respostas do Solicitante no histórico do chat, diferenciando-as visualmente (para o atendente saber o que o Solicitante já tentou). (FW)

- [ ] T01-US3 Modelar as tabelas/coleções no Banco de Dados: `Chamado` (comfk para o Atendimento/Solicitante) e `Log_Auditoria`. (BACK)
- [ ] T02-US3 Definir os contratos de API REST (POST/PATCH) para criação e alteração de status de chamados. (BACK)
- [ ] T03-US3 Implementar as migrations e entidades no ORM para `Chamado` e `Log_Auditoria`. (BACK)
- [ ] T04-US3 Desenvolver a lógica (Service/Endpoint) que cria automaticamente o registro do `Chamado` com status `ABERTO` no exato momento em que a URA (US-02) faz o transbordo. (BACK)
- [ ] T05-US3 Desenvolver endpoint (PATCH) para o atendente alterar o status do chamado. (BACK)
- [ ] T06-US3 Validar se o usuário é um 'ATENDENTE'.
- [ ] T07-US3 Atualizar o status.
- [ ] T08-US3 Gravar automaticamente o registro na tabela de `Log_Auditoria` em uma mesma transação de banco de dados.
- [ ] T09-US3 Atualizar o Middleware/Interceptador de mensagens (da US-01) para bloquear e retornar erro caso uma nova mensagem tente ser enviada em um atendimento cujo status do chamado seja `ENCERRADO`. (BACK)
- [ ] T10-US3 Implementar o componente UI de alteração de status (ex: dropdown no cabeçalho do chat) e integrá-lo com o endpoint de atualização. (FW)
- [ ] T11-US3 Implementar a escuta de um evento WebSocket (`status_changed`) para que, quando o atendente mude o status, a tela do cliente e do próprio atendente reflitam a mudança em tempo real sem precisar dar refresh. (FRONT)
- [ ] T12-US3 Desenvolver a lógica de UI para ocultar/desabilitar o teclado e o campo de digitação de mensagens se o status local mudar para `ENCERRADO`, exibindo um feedback visual claro. (FRONT)
