import chatwoot from '../../../lib/chatwoot';

export default async function handler(req, res) {
  const { contactId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!contactId) {
    return res.status(400).json({ error: 'contactId é obrigatório' });
  }

  try {
    const contact = await chatwoot.getContact(contactId);
    res.status(200).json(contact);
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({ error: 'Erro ao buscar contato', details: error.message });
  }
}
