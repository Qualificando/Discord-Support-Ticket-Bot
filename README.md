# Discord Support Ticket Bot

Um bot de Discord eficiente e personalizável para gerenciar tickets de suporte em seu servidor. Este bot permite que membros criem tickets de suporte que serão tratados em canais privados, permitindo uma comunicação melhor organizada entre sua equipe de suporte e os usuários.

![Discord Support](https://img.shields.io/badge/Discord-Support_Ticket_System-5865F2?style=for-the-badge&logo=discord)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue?style=for-the-badge)

## 📋 Funcionalidades

- **Sistema de ticket intuitivo** com botões e modais interativos
- **Criação fácil de tickets** com formulário detalhado para os usuários
- **Canais privados** para cada ticket com permissões automáticas
- **Sistema de fechamento** de tickets com confirmação
- **Fácil configuração** através de comandos slash (/)
- **Código organizado e comentado** para fácil personalização

## 🖼️ Demonstração

### Interface para usuários
Usuários interagem com um painel simples com botão para criar tickets:

```
┌─────────────────────────────────────┐
│        📝 Sistema de Suporte        │
│                                     │
│ Clique no botão abaixo para criar   │
│ um ticket de suporte.               │
│                                     │
│          [🎫 Criar Ticket]          │
└─────────────────────────────────────┘
```

### Canal de ticket
Cada ticket cria um canal privado com informações do problema:

```
┌─────────────────────────────────────┐
│ Ticket: Problema com pagamento      │
│                                     │
│ Sua solicitação de suporte foi      │
│ criada. Um membro da nossa equipe   │
│ atenderá você em breve.             │
│                                     │
│ Usuário: @username                  │
│ Assunto: Problema com pagamento     │
│ Descrição: Detalhes do problema...  │
│                                     │
│          [🔒 Fechar Ticket]         │
└─────────────────────────────────────┘
```

## 🚀 Instalação

### Pré-requisitos
- Node.js (v16.9.0 ou superior)
- NPM (ou Yarn)
- Uma conta Discord e acesso para criar um bot

### Configuração do Bot Discord
1. Acesse o [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications)
2. Clique em "New Application" e dê um nome para o seu aplicativo
3. Vá para a seção "Bot" e clique em "Add Bot"
4. Em "Privileged Gateway Intents", ative:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
5. Copie o token do seu bot (você usará isso no arquivo `.env`)
6. Vá para a seção "OAuth2" > "URL Generator"
7. Selecione os escopos: `bot` e `applications.commands`
8. Nas permissões do bot, selecione:
   - Manage Channels
   - Manage Roles
   - Read Messages/View Channels
   - Send Messages
   - Manage Messages
   - Embed Links
   - Attach Files
   - Read Message History
   - Add Reactions
9. Copie e acesse o URL gerado para adicionar o bot ao seu servidor

### Configuração do Projeto
1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/discord-support-ticket-bot.git
   cd discord-support-ticket-bot
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env`:
   ```
   TOKEN=seu_token_do_bot_aqui
   CLIENT_ID=id_do_seu_aplicativo_aqui
   ```

4. Inicie o bot:
   ```bash
   npm start
   ```

## 💻 Uso

### Configuração do Sistema de Tickets
1. Use o comando `/setup-tickets` em um canal onde você quer que os membros possam criar tickets
2. O bot enviará uma mensagem com um botão de "Criar Ticket"

### Criando um Ticket (para usuários)
1. Clique no botão "Criar Ticket"
2. Preencha o formulário que aparecerá com:
   - Título do problema
   - Descrição detalhada do problema
3. Um novo canal privado será criado para seu ticket

### Gerenciando Tickets (para moderadores/administradores)
- Os tickets aparecem como canais de texto na categoria "Tickets"
- Use o botão "Fechar Ticket" para encerrar um ticket quando o problema for resolvido
- Confirme o fechamento quando solicitado

## 🛠️ Personalização

### Cores e Aparência
Você pode personalizar as cores dos embeds editando os valores hexadecimais:

```javascript
// Altere a cor do embed do painel de tickets
.setColor(0x3498DB) // Azul

// Altere a cor dos embeds de tickets
.setColor(0x2ECC71) // Verde
```

### Equipe de Suporte
Para adicionar uma equipe de suporte com acesso a todos os tickets, descomente e modifique as linhas:

```javascript
// No permissionOverwrites ao criar o canal de ticket
{
  id: 'ID_DO_CARGO_DE_SUPORTE',
  allow: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory
  ]
}

// E para notificar a equipe quando um ticket é criado
const supportRole = interaction.guild.roles.cache.find(r => r.name === 'Support Team');
if (supportRole) {
  await ticketChannel.send({ content: `<@&${supportRole.id}> Um novo ticket foi criado.` });
}
```

## 📊 Recursos Adicionais (ToDo)

- [ ] Sistema de banco de dados para armazenamento persistente
- [ ] Transcrições de tickets ao fechar
- [ ] Painel de estatísticas para administradores
- [ ] Categorização de tickets por tipo de problema
- [ ] Sistema de avaliação de atendimento
- [ ] Integração com webhook para notificações externas

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/incrivel`)
3. Commit suas alterações (`git commit -m 'Adiciona recurso incrível'`)
4. Push para a branch (`git push origin feature/incrivel`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

Se você tiver alguma dúvida, sinta-se à vontade para entrar em contato:

- **GitHub**: [Qualificando](https://github.com/Qualificando/)
- **Discord**: Fracassais
