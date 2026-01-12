import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dadosKanban, setDadosKanban] = useState(null);
  const [agenteAtivo, setAgenteAtivo] = useState(null);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [showNovoCardModal, setShowNovoCardModal] = useState(false);
  const [contatoAtual, setContatoAtual] = useState(null);
  const [contatoData, setContatoData] = useState(null);
  const [formData, setFormData] = useState({});
  const [theme, setTheme] = useState('light');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    carregarDados();
  }, []);

  const carregarDados = async (manterAgente = false) => {
    setLoading(true);
    try {
      const response = await fetch('/api/kanban');
      const data = await response.json();
      setDadosKanban(data);
      
      if (!manterAgente || !agenteAtivo) {
        const firstAgent = data.conversasPorAgente?.['nao_atribuidas'] ? 'nao_atribuidas' : data.agentes?.[0]?.id;
        setAgenteAtivo(firstAgent);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarNotificacao('Erro ao carregar dados do kanban', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const mostrarNotificacao = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const abrirModalCustomFields = async (contactId) => {
    setContatoAtual(contactId);
    setShowCustomFieldsModal(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      const data = await response.json();
      setContatoData(data);
    } catch (error) {
      console.error('Erro ao buscar contato:', error);
      mostrarNotificacao('Erro ao carregar dados do contato', 'error');
      setShowCustomFieldsModal(false);
    }
  };

  const salvarCustomFields = async () => {
    if (!contatoAtual) return;

    const customAttributes = {};
    dadosKanban?.customFieldDefinitions?.forEach(field => {
      const value = formData[field.attribute_key];
      if (value !== undefined && value !== '') {
        customAttributes[field.attribute_key] = value;
      }
    });

    try {
      const response = await fetch('/api/contacts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contatoAtual, customAttributes })
      });

      const result = await response.json();
      if (result.success) {
        mostrarNotificacao('✅ Informações atualizadas com sucesso!', 'success');
        setShowCustomFieldsModal(false);
        setFormData({});
        carregarDados(true);
      } else {
        mostrarNotificacao('❌ ' + result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      mostrarNotificacao('❌ Erro ao salvar alterações', 'error');
    }
  };

  const criarNovoCard = async (e) => {
    e.preventDefault();
    
    const nome = formData.novo_nome?.trim();
    const mensagem = formData.novo_mensagem?.trim();
    const inboxId = formData.novo_inbox;

    if (!nome || !mensagem || !inboxId) {
      mostrarNotificacao('❌ Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const contactData = {
      name: nome,
      email: formData.novo_email?.trim() || null,
      phone_number: formData.novo_telefone?.trim() || null,
      custom_attributes: {}
    };

    dadosKanban?.customFieldDefinitions?.forEach(field => {
      const value = formData[`novo_custom_${field.attribute_key}`];
      if (value !== undefined && value !== '') {
        contactData.custom_attributes[field.attribute_key] = value;
      }
    });

    mostrarNotificacao('⏳ Criando contato e conversa...', 'info');

    try {
      const response = await fetch('/api/contacts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactData,
          inboxId: parseInt(inboxId),
          initialMessage: mensagem,
          label: formData.novo_etiqueta !== 'Sem Etiqueta' ? formData.novo_etiqueta : null
        })
      });

      const result = await response.json();
      if (result.success) {
        mostrarNotificacao('✅ Card criado com sucesso!', 'success');
        setShowNovoCardModal(false);
        setFormData({});
        setTimeout(() => carregarDados(true), 1000);
      } else {
        mostrarNotificacao('❌ ' + result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao criar card:', error);
      mostrarNotificacao('❌ Erro ao criar card', 'error');
    }
  };

  return (
    <>
      <Head>
        <title>Converte Kanban</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`container ${theme}`}>
        <div className="header">
          <div>
            <h1>📋 Converte Kanban</h1>
            <div className="stats">
              <span>Total de conversas: <strong>{dadosKanban?.totalConversas || 0}</strong></span>
            </div>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Noturno'}</span>
            </button>
            <button className="btn btn-success" onClick={() => setShowNovoCardModal(true)}>
              ➕ Novo Card
            </button>
            <button className="btn btn-secondary" onClick={() => carregarDados(true)}>
              🔄 Recarregar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando dados do Converte...</p>
          </div>
        ) : (
          <>
            <AgentTabs 
              dadosKanban={dadosKanban} 
              agenteAtivo={agenteAtivo}
              setAgenteAtivo={setAgenteAtivo}
              theme={theme}
            />
            
            <KanbanBoard 
              dadosKanban={dadosKanban}
              agenteAtivo={agenteAtivo}
              onReload={() => carregarDados(true)}
              abrirModalCustomFields={abrirModalCustomFields}
              mostrarNotificacao={mostrarNotificacao}
              theme={theme}
            />
          </>
        )}

        {showCustomFieldsModal && (
          <CustomFieldsModal
            contatoData={contatoData}
            dadosKanban={dadosKanban}
            formData={formData}
            setFormData={setFormData}
            onClose={() => { setShowCustomFieldsModal(false); setFormData({}); }}
            onSave={salvarCustomFields}
            theme={theme}
          />
        )}

        {showNovoCardModal && (
          <NovoCardModal
            dadosKanban={dadosKanban}
            formData={formData}
            setFormData={setFormData}
            onClose={() => { setShowNovoCardModal(false); setFormData({}); }}
            onCreate={criarNovoCard}
            theme={theme}
          />
        )}

        {notification.show && (
          <Notification message={notification.message} type={notification.type} theme={theme} />
        )}

        <Styles />
      </div>
    </>
  );
}


// Componente de Notificação
function Notification({ message, type, theme }) {
  return (
    <div className={`notification ${type} show`}>
      {message}
      <style jsx>{`
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          min-width: 250px;
          animation: slideIn 0.3s ease-out;
        }
        .notification.success { border-left: 4px solid #28a745; }
        .notification.error { border-left: 4px solid #dc3545; }
        .notification.info { border-left: 4px solid #17a2b8; }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        :global(.dark-mode) .notification {
          background: #242831;
          color: #e4e6eb;
        }
      `}</style>
    </div>
  );
}

// Componente de Tabs de Agentes
function AgentTabs({ dadosKanban, agenteAtivo, setAgenteAtivo, theme }) {
  if (!dadosKanban) return null;

  const { agentes, conversasPorAgente } = dadosKanban;

  const calcularTotal = (agenteId) => {
    const data = conversasPorAgente[agenteId];
    if (!data) return 0;
    return Object.values(data.conversasPorEtiqueta).reduce((sum, convs) => sum + convs.length, 0);
  };

  return (
    <div className="agent-tabs">
      <div 
        className={`agent-tab ${agenteAtivo === 'nao_atribuidas' ? 'active' : ''}`}
        onClick={() => setAgenteAtivo('nao_atribuidas')}
      >
        <span>👤 Não Atribuídas</span>
        <span className="agent-tab-badge">{calcularTotal('nao_atribuidas')}</span>
      </div>

      {agentes?.map(agente => {
        const iniciais = agente.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return (
          <div 
            key={agente.id}
            className={`agent-tab ${agenteAtivo === agente.id ? 'active' : ''}`}
            onClick={() => setAgenteAtivo(agente.id)}
          >
            <div className="agent-avatar">{iniciais}</div>
            <span>{agente.name}</span>
            <span className="agent-tab-badge">{calcularTotal(agente.id)}</span>
          </div>
        );
      })}

      <style jsx>{`
        .agent-tabs {
          background: white;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          gap: 8px;
          overflow-x: auto;
          flex-wrap: wrap;
        }
        .agent-tab {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          color: #495057;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .agent-tab:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
        .agent-tab.active {
          background: #1f93ff;
          color: white;
          border-color: #1f93ff;
        }
        .agent-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1f93ff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }
        .agent-tab-badge {
          background: rgba(0,0,0,0.1);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }
        .agent-tab.active .agent-tab-badge {
          background: rgba(255,255,255,0.3);
        }
        :global(.dark-mode) .agent-tabs {
          background: #242831;
        }
        :global(.dark-mode) .agent-tab {
          background: #2a2f3a;
          border-color: #3a3f4b;
          color: #e4e6eb;
        }
        :global(.dark-mode) .agent-tab:hover {
          background: #3a3f4b;
        }
      `}</style>
    </div>
  );
}

// Componente principal do Kanban Board
function KanbanBoard({ dadosKanban, agenteAtivo, onReload, abrirModalCustomFields, mostrarNotificacao, theme }) {
  if (!dadosKanban || !agenteAtivo) return null;

  const agenteData = dadosKanban.conversasPorAgente[agenteAtivo];
  if (!agenteData) return null;

  const handleDrop = async (e, etiquetaDestino) => {
    e.preventDefault();
    const conversaId = e.dataTransfer.getData('conversaId');
    const etiquetaOrigem = e.dataTransfer.getData('etiquetaOrigem');

    if (etiquetaOrigem === etiquetaDestino) return;

    mostrarNotificacao('⏳ Movendo conversa...', 'info');

    try {
      const response = await fetch('/api/conversations/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversaId, newLabel: etiquetaDestino })
      });

      const result = await response.json();
      if (result.success) {
        mostrarNotificacao('✅ Conversa movida com sucesso!', 'success');
        onReload();
      } else {
        mostrarNotificacao('❌ Erro ao mover conversa', 'error');
      }
    } catch (error) {
      console.error('Erro ao mover conversa:', error);
      mostrarNotificacao('❌ Erro ao mover conversa', 'error');
    }
  };

  return (
    <div className="kanban-board">
      {dadosKanban.etiquetas.map(etiqueta => (
        <KanbanColumn
          key={etiqueta.title}
          titulo={etiqueta.title}
          cor={etiqueta.color}
          conversas={agenteData.conversasPorEtiqueta[etiqueta.title] || []}
          onDrop={handleDrop}
          abrirModalCustomFields={abrirModalCustomFields}
          theme={theme}
        />
      ))}

      <KanbanColumn
        titulo="Sem Etiqueta"
        cor="#6c757d"
        conversas={agenteData.conversasPorEtiqueta['Sem Etiqueta'] || []}
        onDrop={handleDrop}
        abrirModalCustomFields={abrirModalCustomFields}
        theme={theme}
      />

      <style jsx>{`
        .kanban-board {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding-bottom: 20px;
        }
      `}</style>
    </div>
  );
}


// Componente de Coluna do Kanban
function KanbanColumn({ titulo, cor, conversas, onDrop, abrirModalCustomFields, theme }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          <span style={{ width: 12, height: 12, background: cor, borderRadius: '50%', display: 'inline-block' }} />
          {titulo}
        </div>
        <span className="column-count">{conversas.length}</span>
      </div>
      
      <div 
        className={`column-body ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { onDrop(e, titulo); setDragOver(false); }}
      >
        {conversas.length === 0 ? (
          <div className="empty-state">Nenhuma conversa</div>
        ) : (
          conversas.map(conversa => (
            <KanbanCard 
              key={conversa.id} 
              conversa={conversa} 
              abrirModalCustomFields={abrirModalCustomFields}
              theme={theme}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .kanban-column {
          background: white;
          border-radius: 8px;
          min-width: 300px;
          max-width: 300px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          max-height: 600px;
        }
        .column-header {
          padding: 16px;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        .column-title {
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .column-count {
          background: #1f93ff;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .column-body {
          padding: 12px;
          flex: 1;
          overflow-y: auto;
          min-height: 100px;
        }
        .column-body.drag-over {
          background: #e7f3ff;
          border: 2px dashed #1f93ff;
          border-radius: 6px;
        }
        .empty-state {
          text-align: center;
          padding: 30px 20px;
          color: #6c757d;
          font-size: 14px;
        }
        :global(.dark-mode) .kanban-column {
          background: #242831;
        }
        :global(.dark-mode) .column-header {
          background: #2a2f3a;
          border-bottom-color: #3a3f4b;
        }
        :global(.dark-mode) .column-title {
          color: #e4e6eb;
        }
        :global(.dark-mode) .empty-state {
          color: #b0b3b8;
        }
      `}</style>
    </div>
  );
}

// Componente de Card
function KanbanCard({ conversa, abrirModalCustomFields, theme }) {
  const nomeCliente = conversa.meta?.sender?.name || conversa.meta?.sender?.email || 'Cliente sem nome';
  const dataAtividade = conversa.last_activity_at 
    ? new Date(conversa.last_activity_at * 1000).toLocaleString('pt-BR')
    : 'Sem atividade';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('conversaId', conversa.id);
    e.dataTransfer.setData('etiquetaOrigem', conversa.labels[0] || 'Sem Etiqueta');
  };

  const abrirConversa = () => {
    window.open(conversa.url, '_blank');
  };

  const editarContato = (e) => {
    e.stopPropagation();
    if (conversa.meta?.sender?.id) {
      abrirModalCustomFields(conversa.meta.sender.id);
    }
  };

  return (
    <div 
      className="kanban-card"
      draggable
      onDragStart={handleDragStart}
      onClick={abrirConversa}
    >
      <div className="card-actions">
        <button className="card-action-btn edit-btn" onClick={editarContato} title="Editar contato">
          ✏️
        </button>
      </div>

      <div className="card-header">
        <div className="card-title">{nomeCliente}</div>
        <div className="card-id">#{conversa.id}</div>
      </div>

      <div className="card-meta">
        <div className="status-badge status-open">{conversa.status}</div>
        <div>⏰ {dataAtividade}</div>
        {conversa.messages_count && <div>💬 {conversa.messages_count} mensagens</div>}
      </div>

      <style jsx>{`
        .kanban-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .kanban-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .kanban-card:hover .card-actions {
          opacity: 1;
        }
        .card-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .card-action-btn {
          background: #28a745;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-action-btn:hover {
          background: #218838;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .card-title {
          font-weight: 600;
          font-size: 14px;
          flex: 1;
        }
        .card-id {
          color: #6c757d;
          font-size: 11px;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
        }
        .card-meta {
          font-size: 12px;
          color: #6c757d;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          background: #d1ecf1;
          color: #0c5460;
        }
        :global(.dark-mode) .kanban-card {
          background: #2a2f3a;
          border-color: #3a3f4b;
        }
        :global(.dark-mode) .kanban-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        :global(.dark-mode) .card-title {
          color: #e4e6eb;
        }
        :global(.dark-mode) .card-id {
          color: #b0b3b8;
          background: #1a1d24;
        }
        :global(.dark-mode) .card-meta {
          color: #b0b3b8;
        }
      `}</style>
    </div>
  );
}


// Modal de Custom Fields
function CustomFieldsModal({ contatoData, dadosKanban, formData, setFormData, onClose, onSave, theme }) {
  if (!contatoData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">
            <div className="spinner"></div>
            <p>Carregando dados do contato...</p>
          </div>
        </div>
        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .modal-content {
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
          }
          .loading {
            text-align: center;
            padding: 40px;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #1f93ff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          :global(.dark-mode) .modal-content {
            background: #242831;
            color: #e4e6eb;
          }
        `}</style>
      </div>
    );
  }

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Informações do Contato</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>👤 Nome</label>
            <input type="text" value={contatoData.name || ''} disabled className="form-input" />
          </div>

          <div className="form-group">
            <label>📧 Email</label>
            <input type="text" value={contatoData.email || ''} disabled className="form-input" />
          </div>

          <div className="form-group">
            <label>📱 Telefone</label>
            <input type="text" value={contatoData.phone_number || ''} disabled className="form-input" />
          </div>

          {dadosKanban?.customFieldDefinitions?.length > 0 && (
            <>
              <hr />
              <h3>📝 Campos Personalizados</h3>
              {dadosKanban.customFieldDefinitions.map(field => (
                <div key={field.attribute_key} className="form-group">
                  <label>{field.attribute_display_name}</label>
                  {field.attribute_display_type === 'list' ? (
                    <select 
                      className="form-input"
                      value={formData[field.attribute_key] ?? contatoData.custom_attributes?.[field.attribute_key] ?? ''}
                      onChange={(e) => handleChange(field.attribute_key, e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {field.attribute_values?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.attribute_display_type === 'checkbox' ? (
                    <input 
                      type="checkbox"
                      checked={formData[field.attribute_key] ?? contatoData.custom_attributes?.[field.attribute_key] ?? false}
                      onChange={(e) => handleChange(field.attribute_key, e.target.checked)}
                    />
                  ) : (
                    <input 
                      type="text"
                      className="form-input"
                      value={formData[field.attribute_key] ?? contatoData.custom_attributes?.[field.attribute_key] ?? ''}
                      onChange={(e) => handleChange(field.attribute_key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-success" onClick={onSave}>💾 Salvar</button>
        </div>

        <ModalStyles />
      </div>
    </div>
  );
}


// Modal de Novo Card
function NovoCardModal({ dadosKanban, formData, setFormData, onClose, onCreate, theme }) {
  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Criar Novo Contato/Card</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onCreate}>
          <div className="modal-body">
            <div className="form-group">
              <label>👤 Nome *</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={formData.novo_nome || ''}
                onChange={(e) => handleChange('novo_nome', e.target.value)}
                placeholder="Digite o nome do contato"
              />
            </div>

            <div className="form-group">
              <label>📧 Email</label>
              <input 
                type="email" 
                className="form-input"
                value={formData.novo_email || ''}
                onChange={(e) => handleChange('novo_email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="form-group">
              <label>📱 Telefone</label>
              <input 
                type="tel" 
                className="form-input"
                value={formData.novo_telefone || ''}
                onChange={(e) => handleChange('novo_telefone', e.target.value)}
                placeholder="+55 (00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label>📥 Inbox *</label>
              <select 
                className="form-input" 
                required
                value={formData.novo_inbox || ''}
                onChange={(e) => handleChange('novo_inbox', e.target.value)}
              >
                <option value="">Selecione o inbox...</option>
                {dadosKanban?.inboxes?.map(inbox => (
                  <option key={inbox.id} value={inbox.id}>{inbox.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>💬 Mensagem Inicial *</label>
              <textarea 
                className="form-input" 
                rows="4" 
                required
                value={formData.novo_mensagem || ''}
                onChange={(e) => handleChange('novo_mensagem', e.target.value)}
                placeholder="Digite a primeira mensagem da conversa..."
                style={{ resize: 'vertical' }}
              />
              <small style={{ color: '#6c757d', fontSize: '12px' }}>
                Necessário para criar a conversa e exibir o card no kanban
              </small>
            </div>

            <div className="form-group">
              <label>🏷️ Etiqueta Inicial</label>
              <select 
                className="form-input"
                value={formData.novo_etiqueta || 'Sem Etiqueta'}
                onChange={(e) => handleChange('novo_etiqueta', e.target.value)}
              >
                <option value="Sem Etiqueta">Sem Etiqueta</option>
                {dadosKanban?.etiquetas?.map(etiqueta => (
                  <option key={etiqueta.title} value={etiqueta.title}>{etiqueta.title}</option>
                ))}
              </select>
            </div>

            {dadosKanban?.customFieldDefinitions?.length > 0 && (
              <>
                <hr />
                <h3>📝 Campos Personalizados</h3>
                {dadosKanban.customFieldDefinitions.map(field => (
                  <div key={field.attribute_key} className="form-group">
                    <label>{field.attribute_display_name}</label>
                    {field.attribute_display_type === 'list' ? (
                      <select 
                        className="form-input"
                        value={formData[`novo_custom_${field.attribute_key}`] || ''}
                        onChange={(e) => handleChange(`novo_custom_${field.attribute_key}`, e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {field.attribute_values?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.attribute_display_type === 'checkbox' ? (
                      <input 
                        type="checkbox"
                        checked={formData[`novo_custom_${field.attribute_key}`] || false}
                        onChange={(e) => handleChange(`novo_custom_${field.attribute_key}`, e.target.checked)}
                      />
                    ) : (
                      <input 
                        type="text"
                        className="form-input"
                        value={formData[`novo_custom_${field.attribute_key}`] || ''}
                        onChange={(e) => handleChange(`novo_custom_${field.attribute_key}`, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-success">✅ Criar Contato</button>
          </div>
        </form>

        <ModalStyles />
      </div>
    </div>
  );
}

// Estilos do Modal
function ModalStyles() {
  return (
    <style jsx global>{`
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s;
      }
      .modal-content {
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideDown 0.3s;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e9ecef;
      }
      .modal-header h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #6c757d;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }
      .close-btn:hover {
        background: #f8f9fa;
        color: #1f2d3d;
      }
      .modal-body {
        margin-bottom: 20px;
      }
      .modal-body hr {
        margin: 20px 0;
        border: none;
        border-top: 2px solid #e9ecef;
      }
      .modal-body h3 {
        margin-bottom: 16px;
        font-size: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 14px;
      }
      .form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      .form-input:focus {
        outline: none;
        border-color: #1f93ff;
      }
      .form-input:disabled {
        background: #f8f9fa;
        cursor: not-allowed;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 12px;
        border-top: 2px solid #e9ecef;
      }
      .dark-mode .modal-content {
        background: #242831;
        color: #e4e6eb;
      }
      .dark-mode .modal-header {
        border-bottom-color: #3a3f4b;
      }
      .dark-mode .modal-body hr {
        border-top-color: #3a3f4b;
      }
      .dark-mode .modal-footer {
        border-top-color: #3a3f4b;
      }
      .dark-mode .form-input {
        background: #2a2f3a;
        border-color: #3a3f4b;
        color: #e4e6eb;
      }
      .dark-mode .form-input:disabled {
        background: #1a1d24;
      }
      .dark-mode .close-btn {
        color: #b0b3b8;
      }
      .dark-mode .close-btn:hover {
        background: #3a3f4b;
        color: #e4e6eb;
      }
    `}</style>
  );
}


// Estilos Globais
function Styles() {
  return (
    <style jsx global>{`
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f5f7fa;
        min-height: 100vh;
      }
      
      body.dark-mode {
        background: #1a1d24;
        color: #e4e6eb;
      }
      
      .container {
        padding: 20px;
      }
      
      .header {
        background: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .dark-mode .header {
        background: #242831;
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 8px;
        color: #1f2d3d;
      }
      
      .dark-mode .header h1 {
        color: #e4e6eb;
      }
      
      .stats {
        font-size: 14px;
        color: #6c757d;
      }
      
      .dark-mode .stats {
        color: #b0b3b8;
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      
      .btn {
        background: #1f93ff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .btn-secondary {
        background: #6c757d;
      }
      
      .btn-secondary:hover {
        background: #5a6268;
      }
      
      .btn-success {
        background: #28a745;
      }
      
      .btn-success:hover {
        background: #218838;
      }
      
      .theme-toggle {
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        color: #495057;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s;
        font-size: 14px;
      }
      
      .theme-toggle:hover {
        background: #e9ecef;
        transform: scale(1.05);
      }
      
      .dark-mode .theme-toggle {
        background: #2a2f3a;
        border-color: #3a3f4b;
        color: #e4e6eb;
      }
      
      .dark-mode .theme-toggle:hover {
        background: #3a3f4b;
      }
      
      .loading {
        text-align: center;
        padding: 40px;
        color: #6c757d;
      }
      
      .dark-mode .loading {
        color: #b0b3b8;
      }
      
      .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #1f93ff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @media (max-width: 768px) {
        .header {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .header-actions {
          width: 100%;
        }
        
        .btn, .theme-toggle {
          flex: 1;
          justify-content: center;
        }
      }
    `}</style>
  );
}
