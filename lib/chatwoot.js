import axios from 'axios';

const API_URL = process.env.CHATWOOT_API_URL;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const API_TOKEN = process.env.CHATWOOT_API_TOKEN;

const chatwootClient = axios.create({
  baseURL: `${API_URL}/api/v1/accounts/${ACCOUNT_ID}`,
  headers: {
    'api_access_token': API_TOKEN,
    'Content-Type': 'application/json',
  },
});

export const chatwoot = {
  // Agentes
  async getAgents() {
    const { data } = await chatwootClient.get('/agents');
    return data;
  },

  // Etiquetas
  async getLabels() {
    const { data } = await chatwootClient.get('/labels');
    return Array.isArray(data) ? data : (data.payload || data.data || []);
  },

  // Conversas
  async getConversations(status = 'open', page = 1) {
    const { data } = await chatwootClient.get('/conversations', {
      params: { status, page }
    });
    return data;
  },

  async getAllConversations(status = 'open') {
    let allConversations = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const data = await this.getConversations(status, page);
      
      if (data?.data?.payload && data.data.payload.length > 0) {
        allConversations = allConversations.concat(data.data.payload);
        page++;
      } else {
        hasMore = false;
      }
    }

    return allConversations;
  },

  async updateConversationLabels(conversationId, labels) {
    const { data } = await chatwootClient.post(`/conversations/${conversationId}/labels`, {
      labels
    });
    return data;
  },

  // Contatos
  async getContact(contactId) {
    const { data } = await chatwootClient.get(`/contacts/${contactId}`);
    return data.payload || data;
  },

  async createContact(contactData) {
    const { data } = await chatwootClient.post('/contacts', contactData);
    return data.payload || data;
  },

  async updateContact(contactId, contactData) {
    const { data } = await chatwootClient.put(`/contacts/${contactId}`, contactData);
    return data.payload || data;
  },

  // Conversas
  async createConversation(contactId, inboxId) {
    const { data } = await chatwootClient.post('/conversations', {
      source_id: contactId.toString(),
      inbox_id: inboxId,
      contact_id: contactId,
      status: 'open'
    });
    return data;
  },

  async sendMessage(conversationId, message) {
    const { data } = await chatwootClient.post(`/conversations/${conversationId}/messages`, {
      content: message,
      message_type: 'outgoing',
      private: false
    });
    return data;
  },

  // Inboxes
  async getInboxes() {
    const { data } = await chatwootClient.get('/inboxes');
    return Array.isArray(data) ? data : (data.payload || []);
  },

  // Custom Attributes
  async getCustomAttributeDefinitions() {
    const { data } = await chatwootClient.get('/custom_attribute_definitions');
    const attrs = Array.isArray(data) ? data : (data.payload || []);
    return attrs.filter(attr => attr.attribute_model === 'contact_attribute');
  },
};

export default chatwoot;
