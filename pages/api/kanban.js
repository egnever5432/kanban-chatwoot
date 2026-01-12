import chatwoot from '../../lib/chatwoot';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Busca todos os dados em paralelo
    const [etiquetas, conversas, agentes, inboxes, customFieldDefinitions] = await Promise.all([
      chatwoot.getLabels(),
      chatwoot.getAllConversations('open'),
      chatwoot.getAgents(),
      chatwoot.getInboxes(),
      chatwoot.getCustomAttributeDefinitions(),
    ]);

    // Organiza conversas por agente e etiqueta
    const conversasPorAgente = {};

    // Inicializa estrutura para cada agente
    agentes.forEach(agente => {
      conversasPorAgente[agente.id] = {
        agente: agente,
        conversasPorEtiqueta: {}
      };

      etiquetas.forEach(etiqueta => {
        conversasPorAgente[agente.id].conversasPorEtiqueta[etiqueta.title] = [];
      });

      conversasPorAgente[agente.id].conversasPorEtiqueta['Sem Etiqueta'] = [];
    });

    // Adiciona categoria para conversas não atribuídas
    conversasPorAgente['nao_atribuidas'] = {
      agente: {
        id: 'nao_atribuidas',
        name: 'Não Atribuídas',
        email: '',
        available_name: 'Sem Agente'
      },
      conversasPorEtiqueta: {}
    };

    etiquetas.forEach(etiqueta => {
      conversasPorAgente['nao_atribuidas'].conversasPorEtiqueta[etiqueta.title] = [];
    });
    conversasPorAgente['nao_atribuidas'].conversasPorEtiqueta['Sem Etiqueta'] = [];

    // Distribui as conversas
    conversas.forEach(conversa => {
      // Adiciona URL da conversa
      conversa.url = `${process.env.CHATWOOT_API_URL}/app/accounts/${process.env.CHATWOOT_ACCOUNT_ID}/conversations/${conversa.id}`;

      const agenteId = conversa.meta?.assignee?.id || 'nao_atribuidas';
      const targetAgenteId = conversasPorAgente[agenteId] ? agenteId : 'nao_atribuidas';

      if (conversa.labels && conversa.labels.length > 0) {
        const primeiraEtiqueta = conversa.labels[0];
        if (conversasPorAgente[targetAgenteId].conversasPorEtiqueta[primeiraEtiqueta]) {
          conversasPorAgente[targetAgenteId].conversasPorEtiqueta[primeiraEtiqueta].push(conversa);
        }
      } else {
        conversasPorAgente[targetAgenteId].conversasPorEtiqueta['Sem Etiqueta'].push(conversa);
      }
    });

    res.status(200).json({
      etiquetas,
      conversasPorAgente,
      agentes,
      totalConversas: conversas.length,
      customFieldDefinitions,
      inboxes,
      apiUrl: process.env.CHATWOOT_API_URL,
      accountId: process.env.CHATWOOT_ACCOUNT_ID
    });
  } catch (error) {
    console.error('Erro ao buscar dados do kanban:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do kanban', details: error.message });
  }
}
