import chatwoot from '../../../lib/chatwoot';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contactData, inboxId, initialMessage, label } = req.body;

  if (!contactData || !contactData.name) {
    return res.status(400).json({ error: 'Nome do contato é obrigatório' });
  }

  if (!inboxId) {
    return res.status(400).json({ error: 'Inbox é obrigatório' });
  }

  if (!initialMessage) {
    return res.status(400).json({ error: 'Mensagem inicial é obrigatória' });
  }

  try {
    // 1. Cria o contato
    const contact = await chatwoot.createContact(contactData);

    // 2. Cria a conversa
    const conversation = await chatwoot.createConversation(contact.id, parseInt(inboxId));

    // 3. Envia a mensagem inicial
    await chatwoot.sendMessage(conversation.id, initialMessage);

    // 4. Aplica a etiqueta se fornecida
    if (label && label !== 'Sem Etiqueta') {
      await chatwoot.updateConversationLabels(conversation.id, [label]);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Card criado com sucesso!',
      contact,
      conversation
    });
  } catch (error) {
    console.error('Erro ao criar card:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar card',
      error: error.message 
    });
  }
}
