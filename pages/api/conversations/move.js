import chatwoot from '../../../lib/chatwoot';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversationId, newLabel } = req.body;

  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId é obrigatório' });
  }

  try {
    const labels = newLabel === 'Sem Etiqueta' ? [] : [newLabel];
    await chatwoot.updateConversationLabels(conversationId, labels);

    res.status(200).json({ 
      success: true, 
      message: 'Conversa movida com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao mover conversa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao mover conversa',
      error: error.message 
    });
  }
}
