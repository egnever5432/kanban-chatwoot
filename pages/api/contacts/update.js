import chatwoot from '../../../lib/chatwoot';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contactId, customAttributes } = req.body;

  if (!contactId) {
    return res.status(400).json({ error: 'contactId é obrigatório' });
  }

  try {
    await chatwoot.updateContact(contactId, {
      custom_attributes: customAttributes
    });

    res.status(200).json({ 
      success: true, 
      message: 'Custom fields atualizados com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao atualizar custom fields:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar custom fields',
      error: error.message 
    });
  }
}
