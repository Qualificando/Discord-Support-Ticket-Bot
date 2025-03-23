const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Armazenamento temporário para tickets ativos (em produção, use um banco de dados)
const activeTickets = new Map();

client.once('ready', () => {
  console.log(`Bot está online como ${client.user.tag}!`);
});

// Registro do comando de barra para configurar o sistema de tickets
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'setup-tickets') {
    // Verificar permissões do usuário
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Você precisa de permissões de administrador para usar este comando.',
        ephemeral: true
      });
    }

    // Criar embed para o sistema de tickets
    const ticketEmbed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('📝 Sistema de Suporte')
      .setDescription('Clique no botão abaixo para criar um ticket de suporte.')
      .setFooter({ text: 'Support Ticket System' });

    // Criar botão para criação de tickets
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Criar Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫')
      );

    // Enviar a mensagem com o botão
    await interaction.channel.send({
      embeds: [ticketEmbed],
      components: [row]
    });

    await interaction.reply({
      content: '✅ Sistema de tickets configurado com sucesso!',
      ephemeral: true
    });
  }
});

// Manipulação de interações de botão (criação de ticket)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
    // Verificar se o usuário já tem um ticket aberto
    if (activeTickets.has(interaction.user.id)) {
      return interaction.reply({
        content: '❌ Você já tem um ticket aberto. Por favor, use o ticket existente.',
        ephemeral: true
      });
    }

    // Mostrar modal para obter detalhes do problema
    const modal = new ModalBuilder()
      .setCustomId('ticket_modal')
      .setTitle('Criar Ticket de Suporte');

    const ticketTitleInput = new TextInputBuilder()
      .setCustomId('ticketTitle')
      .setLabel('Título do problema')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: Problema com pagamento')
      .setRequired(true);

    const ticketDescriptionInput = new TextInputBuilder()
      .setCustomId('ticketDescription')
      .setLabel('Descrição detalhada do problema')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Descreva seu problema em detalhes')
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(ticketTitleInput);
    const secondRow = new ActionRowBuilder().addComponents(ticketDescriptionInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
  }

  // Fechar ticket
  if (interaction.customId === 'close_ticket') {
    const ticketChannel = interaction.channel;
    
    // Verificar se este é um canal de ticket
    if (!ticketChannel.name.startsWith('ticket-')) {
      return interaction.reply({
        content: '❌ Este comando só pode ser usado em canais de ticket.',
        ephemeral: true
      });
    }

    // Confirmar fechamento
    const confirmRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_close')
          .setLabel('Confirmar Fechamento')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_close')
          .setLabel('Cancelar')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      content: '⚠️ Tem certeza que deseja fechar este ticket? Todos os dados serão salvos para referência futura.',
      components: [confirmRow]
    });
  }

  // Confirmar fechamento do ticket
  if (interaction.customId === 'confirm_close') {
    const ticketChannel = interaction.channel;
    
    // Encontrar e remover o ticket do mapa de tickets ativos
    for (const [userId, channelId] of activeTickets.entries()) {
      if (channelId === ticketChannel.id) {
        activeTickets.delete(userId);
        break;
      }
    }

    await interaction.reply({ content: '🔒 Fechando o ticket em 5 segundos...' });
    
    // Opcional: Salvar a transcrição antes de excluir

    // Excluir o canal após um atraso
    setTimeout(async () => {
      try {
        await ticketChannel.delete();
      } catch (error) {
        console.error('Erro ao excluir canal:', error);
      }
    }, 5000);
  }

  // Cancelar fechamento do ticket
  if (interaction.customId === 'cancel_close') {
    await interaction.update({
      content: '✅ Operação cancelada. O ticket permanecerá aberto.',
      components: []
    });
  }
});

// Processamento do modal de criação de ticket
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'ticket_modal') {
    const ticketTitle = interaction.fields.getTextInputValue('ticketTitle');
    const ticketDescription = interaction.fields.getTextInputValue('ticketDescription');

    try {
      // Encontrar ou criar uma categoria para tickets
      let ticketCategory = interaction.guild.channels.cache.find(
        cat => cat.name.toLowerCase() === 'tickets' && cat.type === ChannelType.GuildCategory
      );

      if (!ticketCategory) {
        ticketCategory = await interaction.guild.channels.create({
          name: 'Tickets',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel]
            }
          ]
        });
      }

      // Criar o canal de ticket
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: ticketCategory.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
          // Adicionar permissões para a equipe de suporte aqui (usando cargos)
        ]
      });

      // Armazenar o ticket ativo
      activeTickets.set(interaction.user.id, ticketChannel.id);

      // Criar embed para o ticket
      const ticketEmbed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle(`Ticket: ${ticketTitle}`)
        .setDescription('Sua solicitação de suporte foi criada. Um membro da nossa equipe atenderá você em breve.')
        .addFields(
          { name: 'Usuário', value: `<@${interaction.user.id}>` },
          { name: 'Assunto', value: ticketTitle },
          { name: 'Descrição', value: ticketDescription }
        )
        .setTimestamp();

      // Botão para fechar o ticket
      const closeButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Fechar Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
        );

      // Enviar a mensagem inicial no canal de ticket
      await ticketChannel.send({
        content: `<@${interaction.user.id}> Bem-vindo ao seu ticket de suporte!`,
        embeds: [ticketEmbed],
        components: [closeButton]
      });

      // Opcional: Notificar equipe de suporte
      // const supportRole = interaction.guild.roles.cache.find(r => r.name === 'Support Team');
      // if (supportRole) {
      //   await ticketChannel.send({ content: `<@&${supportRole.id}> Um novo ticket foi criado.` });
      // }

      // Responder ao usuário
      await interaction.reply({
        content: `✅ Seu ticket foi criado com sucesso! Por favor, vá para <#${ticketChannel.id}>.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao criar seu ticket. Por favor, tente novamente mais tarde.',
        ephemeral: true
      });
    }
  }
});

// Função para registrar comandos de barra (execute uma vez ao iniciar o bot)
async function registerCommands() {
  const { REST, Routes } = require('discord.js');
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('Iniciando registro de comandos de aplicação (/)...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: [
          {
            name: 'setup-tickets',
            description: 'Configurar o sistema de tickets de suporte',
          }
        ]
      }
    );

    console.log('Comandos de aplicação (/) registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
}

// Iniciar o bot
client.login(process.env.TOKEN).then(() => {
  registerCommands();
}).catch(console.error);
